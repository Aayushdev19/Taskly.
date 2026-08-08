const express = require('express');
const router = express.Router();
const { TodoRepository } = require('../repositories');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const list = await TodoRepository.findByUser(req.user.id);
    res.json(list);
  } catch (err) {
    console.error('Fetch todos error:', err.message);
    res.status(500).send('Server error');
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, priority, category, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const todo = await TodoRepository.create(
      req.user.id,
      title,
      description,
      priority,
      category,
      due_date
    );
    res.json(todo);
  } catch (err) {
    console.error('Create todo error:', err.message);
    res.status(500).send('Server error');
  }
});

router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, category, due_date } = req.body;

  try {
    const currentTodo = await TodoRepository.findByIdAndUser(id, req.user.id);
    if (!currentTodo) {
      return res.status(404).json({ message: 'Todo not found or unauthorized' });
    }

    const fieldsToUpdate = {};
    if (title !== undefined) fieldsToUpdate.title = title;
    if (description !== undefined) fieldsToUpdate.description = description;
    if (status !== undefined) {
      fieldsToUpdate.status = status;
      fieldsToUpdate.completed_at = status === 'completed' ? new Date() : null;
    }
    if (priority !== undefined) fieldsToUpdate.priority = priority;
    if (category !== undefined) fieldsToUpdate.category = category;
    if (due_date !== undefined) fieldsToUpdate.due_date = due_date;

    const updatedTodo = await TodoRepository.update(id, req.user.id, fieldsToUpdate);
    res.json(updatedTodo);
  } catch (err) {
    console.error('Update todo error:', err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const removedTodo = await TodoRepository.delete(id, req.user.id);
    if (!removedTodo) {
      return res.status(404).json({ message: 'Todo not found or unauthorized' });
    }
    res.json({ message: 'Todo removed', todo: removedTodo });
  } catch (err) {
    console.error('Delete todo error:', err.message);
    res.status(500).send('Server error');
  }
});

router.get('/suggestions', auth, async (req, res) => {
  try {
    const analysis = await TodoRepository.getSuggestionsMetrics(req.user.id);
    res.json(analysis);
  } catch (err) {
    console.error('Suggestions calculations error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
