import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiEdit2 } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header animate-fade-in-up">
          <h1>My Profile</h1>
          <p>Manage your account settings</p>
        </div>

        <div className="profile-content animate-fade-in-up delay-1">
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar-large">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2>{user?.name}</h2>
              <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
              
              <div className="profile-stats">
                <div className="p-stat">
                  <span className="p-stat-val">{new Date(user?.createdAt).getFullYear()}</span>
                  <span className="p-stat-lbl">Joined</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-form-card">
              <div className="card-header">
                <h3>Personal Information</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn-edit">
                    <FiEdit2 /> Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className={`profile-form ${!isEditing ? 'read-only' : ''}`}>
                <div className="form-group">
                  <label><FiUser /> Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label><FiMail /> Email Address</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="disabled-input"
                  />
                  <small>Email cannot be changed.</small>
                </div>

                <div className="form-group">
                  <label><FiPhone /> Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label><FiMapPin /> Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Bio / About Me</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows="4"
                    placeholder="Tell others a bit about yourself..."
                  ></textarea>
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" className="btn-save" disabled={loading}>
                      {loading ? 'Saving...' : <><FiSave /> Save Changes</>}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
