import React, { useEffect, useState } from 'react';
import { getTask, updateTask } from '../api';
import { useParams, useNavigate } from 'react-router-dom';

function EditTask() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await getTask(Number(id));
        const task = res.data;

        if (task && task.title !== undefined) {
          setTitle(task.title);
        } else {
          setError('Task not found.');
        }
      } catch (err) {
        setError('Failed to load task.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (title.trim() === '') {
      alert('Task title cannot be empty');
      return;
    }

    try {
      await updateTask(Number(id), { title: title.trim() });
      navigate('/');
    } catch {
      alert('Failed to update task.');
    }
  };

  if (loading) return <p>Loading task...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <form onSubmit={handleUpdate}>
      <h2>Edit Task</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Enter task title"
      />
      <button type="submit">Update</button>
    </form>
  );
}

export default EditTask;
