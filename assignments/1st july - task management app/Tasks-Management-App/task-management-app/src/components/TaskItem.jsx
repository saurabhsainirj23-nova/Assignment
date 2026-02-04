import React, { useState, useEffect } from 'react';

function TaskItem({ task, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);

  useEffect(() => {
    setNewTitle(task.title);
  }, [task.title]);

  const handleSave = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    onUpdate(task.id, { ...task, title: trimmed });
    setIsEditing(false);
  };

  return (
    <tr>
      <td>{task.id}</td>

      <td>
        {isEditing ? (
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        ) : (
          task.title
        )}
      </td>

      <td>
        {isEditing ? (
          <>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => onDelete(task.id)}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}

export default TaskItem;
