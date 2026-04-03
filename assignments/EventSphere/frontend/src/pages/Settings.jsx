import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import './Settings.css';

const Settings = () => {
  const { user, login } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferences, setPreferences] = useState({
    notifications: user?.preferences?.notifications ?? true,
    newsletter: user?.preferences?.newsletter ?? true,
    eventReminders: user?.preferences?.eventReminders ?? true
  });

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await axiosInstance.get('/auth/profile');
        if (response.data) {
          setProfileData({
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            location: response.data.location || '',
            bio: response.data.bio || ''
          });
          setPreferences({
            notifications: response.data.preferences?.notifications ?? true,
            newsletter: response.data.preferences?.newsletter ?? true,
            eventReminders: response.data.preferences?.eventReminders ?? true
          });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axiosInstance.put('/auth/profile', profileData);
      login(response.user, localStorage.getItem('token'));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await axiosInstance.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = async () => {
    setLoading(true);
    
    try {
      await axiosInstance.put('/auth/preferences', preferences);
      toast.success('Preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <h2>Account Settings</h2>
      
      <div className="settings-nav">
        <button 
          className={activeSection === 'profile' ? 'active' : ''} 
          onClick={() => setActiveSection('profile')}
        >
          Profile
        </button>
        <button 
          className={activeSection === 'password' ? 'active' : ''} 
          onClick={() => setActiveSection('password')}
        >
          Change Password
        </button>
        <button 
          className={activeSection === 'preferences' ? 'active' : ''} 
          onClick={() => setActiveSection('preferences')}
        >
          Preferences
        </button>
      </div>

      <div className="settings-content">
        {activeSection === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="settings-form">
            <h3>Edit Profile</h3>
            
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
              />
            </div>
            
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                rows={4}
              />
            </div>
            
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {activeSection === 'password' && (
          <form onSubmit={handlePasswordChange} className="settings-form">
            <h3>Change Password</h3>
            
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              />
            </div>
            
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}

        {activeSection === 'preferences' && (
          <div className="settings-form">
            <h3>Notification Preferences</h3>
            
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                />
                Enable Notifications
              </label>
            </div>
            
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.newsletter}
                  onChange={(e) => setPreferences({...preferences, newsletter: e.target.checked})}
                />
                Subscribe to Newsletter
              </label>
            </div>
            
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.eventReminders}
                  onChange={(e) => setPreferences({...preferences, eventReminders: e.target.checked})}
                />
                Event Reminders
              </label>
            </div>
            
            <button onClick={handlePreferencesSave} className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
