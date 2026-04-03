import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./TaskManager.css";

const API_URL = "http://localhost:5000/api/tasks";

const CATEGORIES = ["General", "Work", "Personal", "Shopping", "Health", "Learning"];
const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Pending", "In Progress", "Completed"];

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [filters, setFilters] = useState({ status: "All", priority: "All", search: "" });
  const [form, setForm] = useState({ title: "", description: "", priority: "Low", category: "General", dueDate: "" });
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.body.className = darkMode ? "dark" : "";
  }, [darkMode]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.status !== "All") params.append("status", filters.status);
      if (filters.priority !== "All") params.append("priority", filters.priority);
      if (filters.search) params.append("search", filters.search);
      
      const res = await axios.get(`${API_URL}?${params}`);
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.priority, filters.search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addTask = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    try {
      setError(null);
      await axios.post(API_URL, form);
      setForm({ title: "", description: "", priority: "Low", category: "General", dueDate: "" });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      setError(null);
      await axios.delete(`${API_URL}/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const updateTask = async (id, data) => {
    try {
      setError(null);
      const res = await axios.put(`${API_URL}/${id}`, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      setEditForm(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const changeStatus = async (id, status) => {
    const task = tasks.find((t) => t.id === id);
    if (task) await updateTask(id, { ...task, status });
  };

  const getPriorityColor = (priority) => {
    const colors = { Low: "#4caf50", Medium: "#ff9800", High: "#f44336" };
    return colors[priority] || "#666";
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  return (
    <div className="task-manager">
      <div className="header">
        <h1>Task Manager</h1>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {error && <div className="error-banner">{error} <button onClick={() => setError(null)}>×</button></div>}

      <div className="stats">
        <div className="stat">Total: {stats.total}</div>
        <div className="stat">Pending: {stats.pending}</div>
        <div className="stat">In Progress: {stats.inProgress}</div>
        <div className="stat">Completed: {stats.completed}</div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
          <option value="All">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}>
          <option value="All">All Priority</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="add-form">
        <input type="text" name="title" placeholder="Task Title *" value={form.title} onChange={handleChange} />
        <input type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <select name="priority" value={form.priority} onChange={handleChange}>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
        <button className="add-btn" onClick={addTask}>Add Task</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="empty">No tasks found</div>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <div key={task.id} className={`task-card ${task.status === "Completed" ? "completed" : ""}`}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className="priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>{task.priority}</span>
              </div>
              <p className="description">{task.description || "No description"}</p>
              <div className="task-meta">
                <span className="category">{task.category}</span>
                {task.dueDate && <span className="due-date">📅 {task.dueDate}</span>}
              </div>
              <div className="task-status">
                <select value={task.status} onChange={(e) => changeStatus(task.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="task-actions">
                <button className="edit-btn" onClick={() => setEditForm(task)}>Edit</button>
                <button className="delete-btn" onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editForm && (
        <div className="modal-overlay" onClick={() => setEditForm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Task</h2>
            <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            <input type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={editForm.dueDate || ""} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} />
            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="modal-actions">
              <button className="save-btn" onClick={() => updateTask(editForm.id, editForm)}>Save</button>
              <button className="cancel-btn" onClick={() => setEditForm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskManager;