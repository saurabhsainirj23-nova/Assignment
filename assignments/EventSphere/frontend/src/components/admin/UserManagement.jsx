import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
} from "../../api/users.api";
import "./AdminComponents.css";

/* =========================
   CONSTANTS
========================= */
const EMPTY_FORM = {
  name: "",
  email: "",
  role: "user",
  password: "",
};

/* =========================
   COMPONENT
========================= */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  /* =========================
     FETCH USERS
  ========================= */
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  /* =========================
     HANDLERS
  ========================= */
  const openModal = (user = null) => {
    if (user) {
      setFormData({ ...user, password: "" });
      setCurrentUser(user);
    } else {
      setFormData(EMPTY_FORM);
      setCurrentUser(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentUser(null);
    setFormData(EMPTY_FORM);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (currentUser) {
        const updated = await updateUser(currentUser._id, formData);
        setUsers((prev) =>
          prev.map((u) => (u._id === updated._id ? updated : u))
        );
      } else {
        const created = await createUser(formData);
        setUsers((prev) => [...prev, created]);
      }
      closeModal();
    } catch {
      setError("Failed to save user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch {
      setError("Failed to delete user");
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role } : u))
      );
    } catch {
      setError("Failed to update role");
    }
  };

  /* =========================
     UI STATES
  ========================= */
  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="error-message">{error}</div>;

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="admin-component-container">
      <div className="admin-component-header">
        <h2>User Management</h2>
        <button className="btn-create" onClick={() => openModal()}>
          <FaPlus /> Add User
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-data">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user._id, e.target.value)
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="action-buttons">
                  <button
                    className="btn-edit"
                    onClick={() => openModal(user)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(user._id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{currentUser ? "Edit User" : "Create User"}</h3>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {!currentUser && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {currentUser ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
