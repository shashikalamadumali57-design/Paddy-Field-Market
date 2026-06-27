import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiMapPin, FiMaximize, FiDroplet, FiSun, FiEye, FiMessageSquare, FiPhone, FiMail, FiCalendar, FiArrowLeft, FiEdit } from 'react-icons/fi';
import './FieldDetails.css';

const shapeLabels = {
  rectangular: 'Rectangular', square: 'Square', irregular: 'Irregular',
  l_shaped: 'L-Shaped', triangular: 'Triangular', circular: 'Circular'
};

const soilLabels = {
  clay: 'Clay', sandy: 'Sandy', loamy: 'Loamy',
  silt: 'Silt', peat: 'Peat', other: 'Other'
};

const waterLabels = {
  river: 'River', well: 'Well', canal: 'Canal',
  rain_fed: 'Rain Fed', irrigation: 'Irrigation', other: 'Other'
};

const FieldDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchField();
    // eslint-disable-next-line
  }, [id]);

  const fetchField = async () => {
    try {
      const res = await api.get(`/fields/${id}`);
      setField(res.data);
    } catch (error) {
      toast.error('Field not found');
      navigate('/browse');
    }
    setLoading(false);
  };

  const startChat = () => {
    if (!user) {
      toast.info('Please login to contact the farmer');
      navigate('/login');
      return;
    }
    navigate('/chat', { state: { receiverId: field.owner._id, receiverName: field.owner.name, fieldId: field._id } });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading field details...</p></div>;
  }

  if (!field) return null;

  const isOwner = user && user._id === field.owner?._id;

  return (
    <div className="field-details-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn animate-fade-in">
          <FiArrowLeft /> Back
        </button>

        <div className="field-details-grid animate-fade-in-up">
          {/* Left: Images & Info */}
          <div className="field-main">
            <div className="field-gallery">
              <div className="gallery-main">
                {field.images && field.images.length > 0 ? (
                  <img src={`http://localhost:5000${field.images[activeImage]}`} alt={field.title} />
                ) : (
                  <div className="gallery-placeholder">
                    <span>🌾</span>
                    <p>No images uploaded</p>
                  </div>
                )}
                <div className="gallery-badge">
                  <span className={`status-badge status-${field.status}`}>{field.status}</span>
                </div>
              </div>
              {field.images && field.images.length > 1 && (
                <div className="gallery-thumbs">
                  {field.images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`thumb ${activeImage === idx ? 'active' : ''}`}
                      onClick={() => setActiveImage(idx)}
                    >
                      <img src={`http://localhost:5000${img}`} alt={`View ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="field-info-section">
              <div className="field-title-row">
                <div>
                  <h1>{field.title}</h1>
                  <div className="field-location">
                    <FiMapPin /> {field.location?.address}, {field.location?.district}, {field.location?.province}
                  </div>
                </div>
                <div className="field-price-box">
                  <span className="field-price">{formatPrice(field.price)}</span>
                </div>
              </div>

              <div className="field-specs">
                <div className="spec-item">
                  <FiMaximize />
                  <div>
                    <span className="spec-label">Size</span>
                    <span className="spec-value">{field.size?.value} {field.size?.unit}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <span className="spec-shape-icon">⬡</span>
                  <div>
                    <span className="spec-label">Shape</span>
                    <span className="spec-value">{shapeLabels[field.shape]}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <FiDroplet />
                  <div>
                    <span className="spec-label">Water Source</span>
                    <span className="spec-value">{waterLabels[field.waterSource]}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <FiSun />
                  <div>
                    <span className="spec-label">Soil Type</span>
                    <span className="spec-value">{soilLabels[field.soilType]}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <span className="spec-shape-icon">🌾</span>
                  <div>
                    <span className="spec-label">Current Crop</span>
                    <span className="spec-value">{field.currentCrop || 'N/A'}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <FiEye />
                  <div>
                    <span className="spec-label">Views</span>
                    <span className="spec-value">{field.views}</span>
                  </div>
                </div>
              </div>

              <div className="field-description">
                <h3>Description</h3>
                <p>{field.description}</p>
              </div>

              <div className="field-meta">
                <FiCalendar />
                <span>Listed on {new Date(field.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Right: Owner & Actions */}
          <div className="field-sidebar">
            <div className="owner-card">
              <h3>Listed by</h3>
              <div className="owner-info">
                <div className="owner-avatar-lg">
                  {field.owner?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="owner-name">{field.owner?.name}</span>
                  <span className="owner-role">Farmer</span>
                </div>
              </div>
              {field.owner?.location && (
                <div className="owner-detail"><FiMapPin /> {field.owner.location}</div>
              )}
              {field.owner?.phone && (
                <div className="owner-detail"><FiPhone /> {field.owner.phone}</div>
              )}
              {field.owner?.email && (
                <div className="owner-detail"><FiMail /> {field.owner.email}</div>
              )}
              {field.owner?.bio && (
                <p className="owner-bio">{field.owner.bio}</p>
              )}
              <div className="owner-since">
                <FiCalendar /> Member since {new Date(field.owner?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </div>
            </div>

            <div className="action-card">
              {isOwner ? (
                <Link to={`/edit-field/${field._id}`} className="btn-action btn-edit-field">
                  <FiEdit /> Edit Listing
                </Link>
              ) : (
                <button onClick={startChat} className="btn-action btn-chat">
                  <FiMessageSquare /> Contact Farmer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldDetails;
