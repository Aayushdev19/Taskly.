import React, { useState, useEffect } from "react";
import { useAuth, API_BASE_URL } from "../context/AuthContext";
import {
  Plus,
  Search,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  ArrowUpDown,
  ChevronDown,
  Check,
  X,
  Clock,
  SlidersHorizontal,
} from "lucide-react";

export default function TaskManager() {
  const { token } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState("medium");
  const [formCategory, setFormCategory] = useState("work");
  const [formDueDate, setFormDueDate] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_desc");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const toLocalDatetimeString = (dateObj) => {
    if (!dateObj) return "";
    const date = new Date(dateObj);
    const pad = (num) => String(num).padStart(2, '0');
    
    const YYYY = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const DD = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  };

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load todos");
      }

      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const resetForm = () => {
    setEditingTodo(null);
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
    setFormCategory("work");
    setFormDueDate("");
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (todo) => {
    setEditingTodo(todo);
    setFormTitle(todo.title);
    setFormDescription(todo.description || "");
    setFormPriority(todo.priority || "medium");
    setFormCategory(todo.category || "other");
    if (todo.due_date) {
      setFormDueDate(toLocalDatetimeString(todo.due_date));
    } else {
      setFormDueDate("");
    }
    setShowModal(true);
  };

  const handleSaveTodo = async (e) => {
    e.preventDefault();
    if (!formTitle) return;

    const payload = {
      title: formTitle,
      description: formDescription,
      priority: formPriority,
      category: formCategory,
      due_date: formDueDate ? new Date(formDueDate).toISOString() : null,
    };

    try {
      let url = `${API_BASE_URL}/todos`;
      let method = "POST";

      if (editingTodo) {
        url = `${API_BASE_URL}/todos/${editingTodo.id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          editingTodo ? "Failed to update task" : "Failed to create task",
        );
      }

      const savedTodo = await response.json();

      if (editingTodo) {
        setTodos(todos.map((t) => (t.id === editingTodo.id ? savedTodo : t)));
      } else {
        setTodos([savedTodo, ...todos]);
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (todo) => {
    const newStatus = todo.status === "completed" ? "pending" : "completed";
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedTodo = await response.json();
      setTodos(todos.map((t) => (t.id === todo.id ? updatedTodo : t)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTodo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case "high":
        return "bg-red-50 text-[#ff9777] border-red-150";
      case "medium":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "low":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-100";
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case "work":
        return "bg-red-50 text-[#ff9777] border-red-150";
      case "personal":
        return "bg-violet-50 text-violet-600 border border-violet-100";
      case "health":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "finance":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-100";
    }
  };

  const isOverdue = (todo) => {
    if (todo.status === "completed" || !todo.due_date) return false;
    return new Date(todo.due_date) < new Date();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeFormatted = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    return `${dateFormatted} at ${timeFormatted}`;
  };

  const filteredTodos = todos
    .filter((todo) => {
      const titleMatch = todo.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const descMatch = (todo.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!titleMatch && !descMatch) return false;

      if (statusFilter !== "all" && todo.status !== statusFilter) return false;
      if (priorityFilter !== "all" && todo.priority !== priorityFilter)
        return false;
      if (categoryFilter !== "all" && todo.category !== categoryFilter)
        return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "created_desc") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === "due_asc") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      }
      if (sortBy === "priority_desc") {
        const weight = { high: 3, medium: 2, low: 1 };
        return (weight[b.priority] || 0) - (weight[a.priority] || 0);
      }
      return 0;
    });

  const activeFiltersCount =
    (statusFilter !== "all" ? 1 : 0) +
    (priorityFilter !== "all" ? 1 : 0) +
    (categoryFilter !== "all" ? 1 : 0);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Tasks</h1>
          <p className="text-slate-500 text-xs">
            Manage and organize your checklist items.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff9777] to-amber-500 hover:from-[#e68262] hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 active:scale-95 hover:shadow-md hover:shadow-red-500/10 shadow-sm self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      <div className="glass-panel p-5 rounded-2xl shadow-sm bg-white border-slate-200/40 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by title or details..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-xs transition-all focus:ring-1 bg-slate-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Mobile Filters Toggle Button */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className={`lg:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all text-xs font-bold shrink-0 ${
              showFiltersMobile || activeFiltersCount > 0
                ? "bg-[#ff9777] border-[#ff9777] text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                showFiltersMobile || activeFiltersCount > 0 ? "bg-white text-[#ff9777]" : "bg-[#ff9777] text-white"
              }`}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible/Responsive Filters Body */}
        <div className={`${showFiltersMobile ? "block" : "hidden"} lg:block pt-3 border-t border-slate-100 space-y-4`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative w-full lg:w-48">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <ArrowUpDown className="h-3.5 w-3.5" />
              </span>
              <select
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border glass-input text-xs appearance-none cursor-pointer bg-slate-50/50"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="created_desc">Created (Newest)</option>
                <option value="due_asc">Due Date (Soonest)</option>
                <option value="priority_desc">Priority (High to Low)</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setCategoryFilter("all");
                }}
                className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff9777] hover:text-[#e68262] self-start lg:self-auto flex items-center gap-1 transition-colors"
              >
                <X className="h-3 w-3" /> Clear Filters
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 text-[11px] border-t border-slate-100 pt-3 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span className="text-slate-450 font-bold uppercase tracking-wider text-[9px] min-w-[50px]">
                Status:
              </span>
              <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-lg border border-slate-200/50">
                {["all", "pending", "completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.04] active:scale-95 ${
                      statusFilter === status
                        ? "bg-[#ff9777] text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span className="text-slate-450 font-bold uppercase tracking-wider text-[9px] min-w-[50px]">
                Priority:
              </span>
              <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-lg border border-slate-200/50">
                {["all", "high", "medium", "low"].map((prio) => (
                  <button
                    key={prio}
                    onClick={() => setPriorityFilter(prio)}
                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.04] active:scale-95 ${
                      priorityFilter === prio
                        ? "bg-[#ff9777] text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span className="text-slate-450 font-bold uppercase tracking-wider text-[9px] min-w-[50px]">
                Tag:
              </span>
              <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-lg border border-slate-200/50">
                {["all", "work", "personal", "health", "finance", "other"].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.04] active:scale-95 ${
                        categoryFilter === cat
                          ? "bg-[#ff9777] text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-slate-200 shimmer"
            ></div>
          ))}
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center shadow-sm bg-white border-slate-200/40">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No tasks found</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Try adjusting your filters or search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTodos.map((todo) => {
            const isCompleted = todo.status === "completed";
            const hasOverdue = isOverdue(todo);

            return (
              <div
                key={todo.id}
                className={`glass-panel p-5 rounded-2xl shadow-sm border relative flex flex-col justify-between bg-white/90 card-hover ${
                  isCompleted
                    ? "opacity-60 border-slate-200/40 bg-slate-50/50"
                    : ""
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(todo.priority)}`}
                      >
                        {todo.priority}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${getCategoryBadge(todo.category)}`}
                      >
                        {todo.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(todo)}
                        className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-1 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleStatus(todo)}
                      className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-600 text-white"
                          : "border-slate-300 hover:border-[#ff9777] bg-slate-50"
                      }`}
                    >
                      {isCompleted && <Check className="h-3 w-3" />}
                    </button>

                    <div className="space-y-1 text-left">
                      <h3
                        className={`text-sm font-bold text-slate-800 transition-all ${isCompleted ? "line-through text-slate-400" : ""}`}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p
                          className={`text-[11px] leading-relaxed text-slate-500 font-medium ${isCompleted ? "text-slate-400" : ""}`}
                        >
                          {todo.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {todo.due_date && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[9px] font-bold">
                    {hasOverdue ? (
                      <div className="flex items-center gap-1 text-rose-600">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Overdue: {formatDate(todo.due_date)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Due: {formatDate(todo.due_date)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-5 sm:p-6 shadow-xl relative border border-slate-200/80 bg-white animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-bold text-slate-800 mb-4">
              {editingTodo ? "Edit Task" : "Add Task"}
            </h2>

            <form onSubmit={handleSaveTodo} className="space-y-4 text-left">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Task title"
                  className="w-full px-3.5 py-2.5 rounded-xl border glass-input text-xs transition-all focus:ring-1 bg-slate-50/50"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Details
                </label>
                <textarea
                  placeholder="Add details..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border glass-input text-xs transition-all focus:ring-1 resize-none bg-slate-50/50"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["low", "medium", "high"].map((prio) => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setFormPriority(prio)}
                      className={`py-2 rounded-xl text-[10px] uppercase font-bold tracking-wider border transition-all ${
                        formPriority === prio
                          ? prio === "high"
                            ? "bg-red-50 border-[#ff9777] text-[#ff9777] shadow-sm"
                            : prio === "medium"
                              ? "bg-blue-50 border-blue-450 text-blue-600 shadow-sm"
                              : "bg-emerald-50 border-emerald-450 text-emerald-600 shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tag
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-3 pr-8 py-2.5 rounded-xl border glass-input text-xs appearance-none cursor-pointer bg-slate-50/50"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="health">Health</option>
                      <option value="finance">Finance</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2.5 rounded-xl border glass-input text-xs transition-all focus:ring-1 bg-slate-50/50"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff9777] to-amber-500 hover:from-[#e68262] hover:to-amber-600 text-white text-[10px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
