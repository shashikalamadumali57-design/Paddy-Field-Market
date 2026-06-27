import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiPlusCircle, FiMapPin, FiEye, FiEdit, FiTrash2, FiMessageSquare, FiGrid, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    try {
      if (user.role === 'farmer') {
        const res = await api.get('/fields/my-fields');
        setFields(res.data);
      }
      try {
        const msgRes = await api.get('/messages/conversations');
        setConversations(msgRes.data);
      } catch (e) { /* no conversations yet */ }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const deleteField = async (id) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await api.delete(`/fields/${id}`);
        setFields(fields.filter(f => f._id !== id));
        toast.success('Field deleted successfully');
      } catch (error) {
        toast.error('Failed to delete field');
      }
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000000) return `Rs. ${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `Rs. ${(price / 1000).toFixed(0)}K`;
    return `Rs. ${price}`;
  };

  const totalViews = fields.reduce((acc, f) => acc + (f.views || 0), 0);
  const totalValue = fields.reduce((acc, f) => acc + (f.price || 0), 0);

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header animate-fade-in-up">
          <div>
            <h1>Welcome, {user.name} 👋</h1>
            <p className="dashboard-subtitle">
              {user.role === 'farmer' ? 'Manage your paddy field listings' : 'Find your perfect paddy field'}
            </p>
          </div>
          {user.role === 'farmer' && (
            <Link to="/add-field" className="btn-primary-lg">
              <FiPlusCircle /> Add New Field
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="stats-grid animate-fade-in-up delay-1">
          {user.role === 'farmer' ? (
            <>
              <div className="stat-card sc-green">
                <div className="stat-card-icon"><FiGrid /></div>
                <div className="stat-card-info">
                  <span className="stat-card-value">{fields.length}</span>
                  <span className="stat-card-label">My Listings</span>
                </div>
              </div>
              <div className="stat-card sc-blue">
                <div className="stat-card-icon"><FiEye /></div>
                <div className="stat-card-info">
                  <span className="stat-card-value">{totalViews}</span>
                  <span className="stat-card-label">Total Views</span>
                </div>
              </div>
              <div className="stat-card sc-gold">
                <div className="stat-card-icon"><FiDollarSign /></div>
                <div className="stat-card-info">
                  <span className="stat-card-value">{formatPrice(totalValue)}</span>
                  <span className="stat-card-label">Total Value</span>
                </div>
              </div>
              <div className="stat-card sc-purple">
                <div className="stat-card-icon"><FiMessageSquare /></div>
                <div className="stat-card-info">
                  <span className="stat-card-value">{conversations.length}</span>
                  <span className="stat-card-label">Conversations</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="stat-card sc-blue">
                <div className="stat-card-icon"><FiTrendingUp /></div>
                <div className="stat-card-info">
                  <span className="stat-card-value">Browse</span>
                  <span className="stat-card-label">Find Fields</span>
                </div>
              </div>
              <div className="stat-card sc-purple">
                <div className="stat-card-icon"><FiMessageSquare /></div>
                <div className="stat-card-info">
                  <span className="stat-card-value">{conversations.length}</span>
                  <span className="stat-card-label">Conversations</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Farmer: My Fields Table */}
        {user.role === 'farmer' && (
          <div className="dashboard-section animate-fade-in-up delay-2">
            <div className="section-title-row">
              <h2><FiGrid /> My Field Listings</h2>
            </div>
            {fields.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🌾</span>
                <h3>No fields listed yet</h3>
                <p>Start by adding your first paddy field listing</p>
                <Link to="/add-field" className="btn-primary-lg"><FiPlusCircle /> Add Field</Link>
              </div>
            ) : (
              <div className="fields-table-wrapper">
                <table className="fields-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Location</th>
                      <th>Size</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(field => (
                      <tr key={field._id}>
                        <td>
                          <Link to={`/field/${field._id}`} className="field-name-link">
                            {field.title}
                          </Link>
                        </td>
                        <td>
                          <span className="location-cell">
                            <FiMapPin /> {field.location?.district}
                          </span>
                        </td>
                        <td>{field.size?.value} {field.size?.unit}</td>
                        <td className="price-cell">{formatPrice(field.price)}</td>
                        <td>
                          <span className={`status-badge status-${field.status}`}>
                            {field.status}
                          </span>
                        </td>
                        <td>{field.views || 0}</td>
                        <td>
                          <div className="action-btns">
                            <Link to={`/edit-field/${field._id}`} className="action-btn edit-btn" title="Edit">
                              <FiEdit />
                            </Link>
                            <button onClick={() => deleteField(field._id)} className="action-btn delete-btn" title="Delete">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Buyer: Quick Actions */}
        {user.role === 'buyer' && (
          <div className="dashboard-section animate-fade-in-up delay-2">
            <div className="buyer-actions-grid">
              <Link to="/browse" className="buyer-action-card">
                <div className="bac-icon bac-green"><FiMapPin /></div>
                <h3>Browse Fields</h3>
                <p>Explore available paddy fields by location, size, and price</p>
              </Link>
              <Link to="/chat" className="buyer-action-card">
                <div className="bac-icon bac-blue"><FiMessageSquare /></div>
                <h3>My Messages</h3>
                <p>Chat with farmers about fields you're interested in</p>
              </Link>
              <Link to="/profile" className="buyer-action-card">
                <div className="bac-icon bac-purple"><FiEdit /></div>
                <h3>Edit Profile</h3>
                <p>Update your profile information and preferences</p>
              </Link>
            </div>
          </div>
        )}

        {/* Recent Conversations */}
        {conversations.length > 0 && (
          <div className="dashboard-section animate-fade-in-up delay-3">
            <div className="section-title-row">
              <h2><FiMessageSquare /> Recent Conversations</h2>
              <Link to="/chat" className="view-all-link">View All →</Link>
            </div>
            <div className="conversations-list">
              {conversations.slice(0, 5).map((conv, idx) => (
                <Link to="/chat" key={idx} className="conversation-item">
                  <div className="conv-avatar">
                    {conv.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="conv-info">
                    <span className="conv-name">{conv.user?.name}</span>
                    <span className="conv-msg">{conv.lastMessage}</span>
                  </div>
                  <div className="conv-meta">
                    <span className="conv-time">
                      {new Date(conv.lastMessageDate).toLocaleDateString()}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="conv-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
