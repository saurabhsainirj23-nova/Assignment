import React, { useEffect, useState, useCallback } from 'react';
import { getTasks, deleteTask } from '../api';
import { Link } from 'react-router-dom';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      const res = await getTasks();
      setTasks(res.data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      alert('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task.');
    }
  };

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Task List</h2>
        <Link to="/add">➕ Add Task</Link>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Task Title</th>
              <th style={{ width: '180px' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task, index) => (
              <tr key={task.id}>
                <td>{index + 1}</td>
                <td>{task.title}</td>
                <td>
                  <Link to={`/edit/${task.id}`}>Edit</Link>{' '}
                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    style={{ marginLeft: '8px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TaskList;
