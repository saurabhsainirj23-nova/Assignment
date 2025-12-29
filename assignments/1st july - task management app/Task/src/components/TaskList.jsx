import React, { useEffect, useState, useCallback } from 'react';
import { getTasks, deleteTask } from '../api';
import { Link } from 'react-router-dom';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    const res = await getTasks();
    setTasks(res.data);
    setLoading(false);
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (!confirmDelete) return;
    await deleteTask(id);
    loadTasks();
  };

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <div>
      <h2>Task List</h2>
      <Link to="/add">Add Task</Link>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              {task.title}
              {' '}
              <Link to={`/edit/${task.id}`}>Edit</Link>
              {' '}
              <button onClick={() => handleDelete(task.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskList;
