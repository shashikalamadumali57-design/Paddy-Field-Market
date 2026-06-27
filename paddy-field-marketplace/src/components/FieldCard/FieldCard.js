import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiMaximize, FiDollarSign, FiEye } from 'react-icons/fi';
import './FieldCard.css';

const shapeIcons = {
  rectangular: '▬',
  square: '⬜',
  irregular: '⬡',
  l_shaped: '⌐',
  triangular: '△',
  circular: '⬤'
};

const FieldCard = ({ field }) => {
  const formatPrice = (price) => {
    if (price >= 1000000) return `Rs. ${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `Rs. ${(price / 1000).toFixed(0)}K`;
    return `Rs. ${price}`;
  };

  return (
    <Link to={`/field/${field._id}`} className="field-card animate-fade-in-up">
      <div className="field-card-image">
        {field.images && field.images.length > 0 ? (
          <img src={`http://localhost:5000${field.images[0]}`} alt={field.title} />
        ) : (
          <div className="field-card-placeholder">
            <span className="shape-icon">{shapeIcons[field.shape] || '🌾'}</span>
            <span>Paddy Field</span>
          </div>
        )}
        <div className="field-card-badge">
          <span className={`status-badge status-${field.status}`}>
            {field.status}
          </span>
        </div>
        <div className="field-card-price-tag">
          {formatPrice(field.price)}
        </div>
      </div>

      <div className="field-card-body">
        <h3 className="field-card-title">{field.title}</h3>
        
        <div className="field-card-location">
          <FiMapPin />
          <span>{field.location?.district}, {field.location?.province}</span>
        </div>

        <div className="field-card-details">
          <div className="field-detail">
            <FiMaximize />
            <span>{field.size?.value} {field.size?.unit}</span>
          </div>
          <div className="field-detail">
            <span className="shape-mini">{shapeIcons[field.shape]}</span>
            <span>{field.shape?.replace('_', '-')}</span>
          </div>
          <div className="field-detail">
            <FiEye />
            <span>{field.views || 0} views</span>
          </div>
        </div>

        <div className="field-card-footer">
          <div className="field-owner">
            <div className="owner-avatar">
              {field.owner?.name?.charAt(0).toUpperCase()}
            </div>
            <span>{field.owner?.name}</span>
          </div>
          <span className="field-date">
            {new Date(field.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default FieldCard;
