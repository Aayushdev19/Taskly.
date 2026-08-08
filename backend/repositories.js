const mongoose = require('mongoose');
const { User, Todo } = require('./models');
const { getDbState } = require('./db');
const { generateUserSuggestions } = require('./utils/suggestions');

const mockDb = {
  users: [],
  todos: [],
};

const MemoryUserRepository = {
  async findByEmail(email) {
    const rows = mockDb.users.filter(u => u.email.toLowerCase() === email.toLowerCase());
    return rows.length > 0 ? JSON.parse(JSON.stringify(rows[0])) : null;
  },

  async findById(id) {
    const userId = parseInt(id);
    const rows = mockDb.users.filter(u => u.id === userId);
    return rows.length > 0 ? JSON.parse(JSON.stringify(rows[0])) : null;
  },

  async create(email, passwordHash, name = '', role = 'user') {
    const newUser = {
      id: mockDb.users.length + 1,
      email,
      password_hash: passwordHash,
      name,
      avatar: '',
      role,
      created_at: new Date(),
    };
    mockDb.users.push(newUser);
    return JSON.parse(JSON.stringify(newUser));
  },

  async updateProfile(id, name, avatar) {
    const userId = parseInt(id);
    const index = mockDb.users.findIndex(u => u.id === userId);
    if (index === -1) return null;
    if (name !== undefined) mockDb.users[index].name = name;
    if (avatar !== undefined) mockDb.users[index].avatar = avatar;
    return JSON.parse(JSON.stringify(mockDb.users[index]));
  },

  async getAllWithStats() {
    const rows = mockDb.users.map(u => {
      const userTodos = mockDb.todos.filter(t => t.user_id === u.id);
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        avatar: u.avatar,
        role: u.role,
        created_at: u.created_at,
        total_todos: userTodos.length,
        completed_todos: userTodos.filter(t => t.status === 'completed').length,
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return JSON.parse(JSON.stringify(rows));
  },

  async countAll() {
    return mockDb.users.length;
  },

  async getSignupTrends() {
    const counts = {};
    mockDb.users.forEach(u => {
      const dateStr = new Date(u.created_at).toISOString().split('T')[0];
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    const rows = Object.entries(counts).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    return JSON.parse(JSON.stringify(rows));
  }
};

const MemoryTodoRepository = {
  async findByUser(userId) {
    const uid = parseInt(userId);
    const rows = mockDb.todos
      .filter(t => t.user_id === uid)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return JSON.parse(JSON.stringify(rows));
  },

  async findByIdAndUser(id, userId) {
    const tid = parseInt(id);
    const uid = parseInt(userId);
    const rows = mockDb.todos.filter(t => t.id === tid && t.user_id === uid);
    return rows.length > 0 ? JSON.parse(JSON.stringify(rows[0])) : null;
  },

  async create(userId, title, description, priority, category, dueDate) {
    const uid = parseInt(userId);
    const newTodo = {
      id: mockDb.todos.length + 1,
      user_id: uid,
      title,
      description: description || '',
      status: 'pending',
      priority: priority || 'medium',
      category: category || 'other',
      due_date: dueDate || null,
      completed_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockDb.todos.push(newTodo);
    return JSON.parse(JSON.stringify(newTodo));
  },

  async update(id, userId, fields) {
    const tid = parseInt(id);
    const uid = parseInt(userId);
    const index = mockDb.todos.findIndex(t => t.id === tid && t.user_id === uid);
    if (index === -1) return null;

    const current = mockDb.todos[index];
    const updated = {
      ...current,
      ...fields,
      updated_at: new Date(),
    };
    mockDb.todos[index] = updated;
    return JSON.parse(JSON.stringify(updated));
  },

  async delete(id, userId) {
    const tid = parseInt(id);
    const uid = parseInt(userId);
    const index = mockDb.todos.findIndex(t => t.id === tid && t.user_id === uid);
    if (index === -1) return null;
    const removed = mockDb.todos.splice(index, 1)[0];
    return JSON.parse(JSON.stringify(removed));
  },

  async getSuggestionsMetrics(userId) {
    const uid = parseInt(userId);
    const rows = mockDb.todos.filter(t => t.user_id === uid);
    return generateUserSuggestions(JSON.parse(JSON.stringify(rows)));
  },

  async countAll() {
    return mockDb.todos.length;
  },

  async getCompletedCount() {
    return mockDb.todos.filter(t => t.status === 'completed').length;
  },

  async getCategorySplit() {
    const counts = {};
    mockDb.todos.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    const rows = Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    })).sort((a, b) => b.value - a.value);
    return JSON.parse(JSON.stringify(rows));
  }
};

const MongoUserRepository = {
  async findByEmail(email) {
    const u = await User.findOne({ email });
    return u ? u.toObject() : null;
  },

  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const u = await User.findById(id);
    return u ? u.toObject() : null;
  },

  async create(email, passwordHash, name = '', role = 'user') {
    const u = new User({ email, password_hash: passwordHash, name, role });
    const saved = await u.save();
    return saved.toObject();
  },

  async updateProfile(id, name, avatar) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { name, avatar } },
      { new: true }
    );
    return updated ? updated.toObject() : null;
  },

  async getAllWithStats() {
    const list = await User.aggregate([
      {
        $lookup: {
          from: 'todos',
          localField: '_id',
          foreignField: 'user_id',
          as: 'todos'
        }
      },
      {
        $project: {
          _id: 1,
          email: 1,
          name: 1,
          avatar: 1,
          role: 1,
          created_at: 1,
          total_todos: { $size: '$todos' },
          completed_todos: {
            $size: {
              $filter: {
                input: '$todos',
                as: 't',
                cond: { $eq: ['$$t.status', 'completed'] }
              }
            }
          }
        }
      },
      { $sort: { created_at: -1 } }
    ]);
    return list.map(item => ({
      id: item._id.toString(),
      email: item.email,
      name: item.name || '',
      avatar: item.avatar || '',
      role: item.role,
      created_at: item.created_at,
      total_todos: item.total_todos,
      completed_todos: item.completed_todos
    }));
  },

  async countAll() {
    return await User.countDocuments();
  },

  async getSignupTrends() {
    const trends = await User.aggregate([
      {
        $match: {
          created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    return trends.map(t => ({
      date: new Date(t._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: t.count
    }));
  }
};

const MongoTodoRepository = {
  async findByUser(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    const list = await Todo.find({ user_id: userId }).sort({ created_at: -1 });
    return list.map(t => {
      const obj = t.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
  },

  async findByIdAndUser(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) return null;
    const t = await Todo.findOne({ _id: id, user_id: userId });
    if (!t) return null;
    const obj = t.toObject();
    obj.id = obj._id.toString();
    return obj;
  },

  async create(userId, title, description, priority, category, dueDate) {
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid User ID');
    const t = new Todo({
      user_id: userId,
      title,
      description,
      priority,
      category,
      due_date: dueDate
    });
    const saved = await t.save();
    const obj = saved.toObject();
    obj.id = obj._id.toString();
    return obj;
  },

  async update(id, userId, fields) {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) return null;
    const updated = await Todo.findOneAndUpdate(
      { _id: id, user_id: userId },
      { ...fields, updated_at: new Date() },
      { new: true }
    );
    if (!updated) return null;
    const obj = updated.toObject();
    obj.id = obj._id.toString();
    return obj;
  },

  async delete(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) return null;
    const removed = await Todo.findOneAndDelete({ _id: id, user_id: userId });
    if (!removed) return null;
    const obj = removed.toObject();
    obj.id = obj._id.toString();
    return obj;
  },

  async getSuggestionsMetrics(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return generateUserSuggestions([]);
    }
    const list = await Todo.find({ user_id: userId });
    const plainTodos = list.map(t => {
      const obj = t.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    return generateUserSuggestions(plainTodos);
  },

  async countAll() {
    return await Todo.countDocuments();
  },

  async getCompletedCount() {
    return await Todo.countDocuments({ status: 'completed' });
  },

  async getCategorySplit() {
    const list = await Todo.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    return list.map(c => ({
      name: c._id.charAt(0).toUpperCase() + c._id.slice(1),
      value: c.count
    }));
  }
};

const UserRepository = {
  findByEmail(email) {
    return getDbState().useMock ? MemoryUserRepository.findByEmail(email) : MongoUserRepository.findByEmail(email);
  },
  findById(id) {
    return getDbState().useMock ? MemoryUserRepository.findById(id) : MongoUserRepository.findById(id);
  },
  create(email, passwordHash, name, role) {
    return getDbState().useMock 
      ? MemoryUserRepository.create(email, passwordHash, name, role) 
      : MongoUserRepository.create(email, passwordHash, name, role);
  },
  updateProfile(id, name, avatar) {
    return getDbState().useMock 
      ? MemoryUserRepository.updateProfile(id, name, avatar) 
      : MongoUserRepository.updateProfile(id, name, avatar);
  },
  getAllWithStats() {
    return getDbState().useMock ? MemoryUserRepository.getAllWithStats() : MongoUserRepository.getAllWithStats();
  },
  countAll() {
    return getDbState().useMock ? MemoryUserRepository.countAll() : MongoUserRepository.countAll();
  },
  getSignupTrends() {
    return getDbState().useMock ? MemoryUserRepository.getSignupTrends() : MongoUserRepository.getSignupTrends();
  }
};

const TodoRepository = {
  findByUser(userId) {
    return getDbState().useMock ? MemoryTodoRepository.findByUser(userId) : MongoTodoRepository.findByUser(userId);
  },
  findByIdAndUser(id, userId) {
    return getDbState().useMock ? MemoryTodoRepository.findByIdAndUser(id, userId) : MongoTodoRepository.findByIdAndUser(id, userId);
  },
  create(userId, title, description, priority, category, dueDate) {
    return getDbState().useMock ? MemoryTodoRepository.create(userId, title, description, priority, category, dueDate) : MongoTodoRepository.create(userId, title, description, priority, category, dueDate);
  },
  update(id, userId, fields) {
    return getDbState().useMock ? MemoryTodoRepository.update(id, userId, fields) : MongoTodoRepository.update(id, userId, fields);
  },
  delete(id, userId) {
    return getDbState().useMock ? MemoryTodoRepository.delete(id, userId) : MongoTodoRepository.delete(id, userId);
  },
  getSuggestionsMetrics(userId) {
    return getDbState().useMock ? MemoryTodoRepository.getSuggestionsMetrics(userId) : MongoTodoRepository.getSuggestionsMetrics(userId);
  },
  countAll() {
    return getDbState().useMock ? MemoryTodoRepository.countAll() : MongoTodoRepository.countAll();
  },
  getCompletedCount() {
    return getDbState().useMock ? MemoryTodoRepository.getCompletedCount() : MongoTodoRepository.getCompletedCount();
  },
  getCategorySplit() {
    return getDbState().useMock ? MemoryTodoRepository.getCategorySplit() : MongoTodoRepository.getCategorySplit();
  }
};

module.exports = {
  UserRepository,
  TodoRepository,
};
