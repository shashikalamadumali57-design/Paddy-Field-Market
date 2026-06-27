import React from 'react';
import { Link } from 'react-router-dom';
import { GiWheat } from 'react-icons/gi';
import { FiMail, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon"><GiWheat /></div>
                <div>
                  <h3>PaddyMart</h3>
                  <p className="footer-tagline">Field Marketplace</p>
                </div>
              </div>
              <p className="footer-desc">
                Connecting farmers with buyers. The trusted marketplace for paddy field transactions across the region.
              </p>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/browse">Browse Fields</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>For Users</h4>
              <ul>
                <li><Link to="/register">Sell Your Field</Link></li>
                <li><Link to="/browse">Buy a Field</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/chat">Messages</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contact</h4>
              <ul className="contact-list">
                <li><FiMail /> info@paddymart.com</li>
                <li><FiPhone /> +94 11 234 5678</li>
                <li><FiMapPin /> Colombo, Sri Lanka</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2024 PaddyMart. All rights reserved.</p>
            <p className="footer-credit">Made with <FiHeart className="heart-icon" /> for Farmers</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
