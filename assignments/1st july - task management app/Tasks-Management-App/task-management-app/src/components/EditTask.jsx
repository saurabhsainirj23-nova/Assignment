import React, { useEffect, useState } from 'react';
import { getTask, updateTask } from '../api';
import { useParams, useNavigate } from 'react-router-dom';

function EditTask() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await getTask(Number(id));
        setTitle(res.data?.title || '');
      } catch (error) {
        console.error('Failed to load task:', error);
        alert('Failed to load task.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    try {
      setSaving(true);
      await updateTask(Number(id), { title: trimmedTitle });
      navigate('/');
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading task...</p>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <form onSubmit={handleUpdate}>
        <h2>Edit Task</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={saving}>
            {saving ? 'Updating...' : 'Update Task'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ background: '#aaa' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditTask;
