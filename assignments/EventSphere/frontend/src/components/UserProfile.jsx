import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaSave, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    preferences: {
      notifications: true,
      newsletter: true,
      eventReminders: true
    },
    avatar: null
  });
  
  // Initialize form data with user data when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await axiosInstance.get('/auth/profile');
        const userData = response.data;
        
        if (userData) {
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            location: userData.location || '',
            bio: userData.bio || '',
            preferences: {
              notifications: userData.preferences?.notifications !== false,
              newsletter: userData.preferences?.newsletter !== false,
              eventReminders: userData.preferences?.eventReminders !== false
            },
            avatar: userData.avatar || null
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to auth context user
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            location: user.location || '',
            bio: user.bio || '',
            preferences: {
              notifications: user.preferences?.notifications !== false,
              newsletter: user.preferences?.newsletter !== false,
              eventReminders: user.preferences?.eventReminders !== false
            },
            avatar: user.avatar || null
          });
        }
      }
    };
    
    loadUserProfile();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: checked
      }
    }));
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload this file to a server
      // For now, we'll just create a local URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Update profile
      const profileResponse = await axiosInstance.put('/auth/profile', {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio
      });
      
      // Update preferences
      await axiosInstance.put('/auth/preferences', formData.preferences);
      
      // Update auth context with new user data
      if (profileResponse.user) {
        localStorage.setItem('user', JSON.stringify(profileResponse.user));
      }
      
      toast.success('Profile and preferences updated successfully!');
      setSuccess(true);
      setIsEditing(false);
    } catch (err) {
      const errMsg = err.response?.data?.msg || 'Failed to update profile';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>User Profile</h2>
        <button 
          className="edit-profile-btn"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>
      
      {error && (
        <div className="profile-alert error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="profile-alert success">
          Profile updated successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="avatar-section">
          <div className="avatar-container">
            {formData.avatar ? (
              <img 
                src={formData.avatar} 
                alt="User avatar" 
                className="user-avatar" 
              />
            ) : (
              <div className="avatar-placeholder">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            
            {isEditing && (
              <label className="avatar-upload-label">
                <FaCamera />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="avatar-upload-input" 
                />
              </label>
            )}
          </div>
        </div>
        
        <div className="form-section">
          <h3>Personal Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">
              <FaUser /> Name
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              disabled={!isEditing} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope /> Email
            </label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              disabled={!isEditing} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">
              <FaPhone /> Phone
            </label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              disabled={!isEditing} 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="location">
              <FaMapMarkerAlt /> Location
            </label>
            <input 
              type="text" 
              id="location" 
              name="location" 
              value={formData.location} 
              onChange={handleInputChange} 
              disabled={!isEditing} 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea 
              id="bio" 
              name="bio" 
              value={formData.bio} 
              onChange={handleInputChange} 
              disabled={!isEditing} 
              rows="4" 
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Preferences</h3>
          
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="notifications" 
              name="notifications" 
              checked={formData.preferences.notifications} 
              onChange={handlePreferenceChange} 
              disabled={!isEditing} 
            />
            <label htmlFor="notifications">Email Notifications</label>
          </div>
          
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="newsletter" 
              name="newsletter" 
              checked={formData.preferences.newsletter} 
              onChange={handlePreferenceChange} 
              disabled={!isEditing} 
            />
            <label htmlFor="newsletter">Subscribe to Newsletter</label>
          </div>
          
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="eventReminders" 
              name="eventReminders" 
              checked={formData.preferences.eventReminders} 
              onChange={handlePreferenceChange} 
              disabled={!isEditing} 
            />
            <label htmlFor="eventReminders">Event Reminders</label>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Security</h3>
          
          <div className="form-group">
            <button 
              type="button" 
              className="change-password-btn" 
              disabled={!isEditing}
            >
              <FaLock /> Change Password
            </button>
          </div>
        </div>
        
        {isEditing && (
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-profile-btn" 
              disabled={loading}
            >
              {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default UserProfile;