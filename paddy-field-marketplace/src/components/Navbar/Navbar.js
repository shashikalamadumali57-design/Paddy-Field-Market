import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiMessageSquare, FiGrid, FiPlusCircle, FiHome, FiSearch, FiChevronDown } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <GiWheat />
          </div>
          <div className="logo-text">
            <span className="logo-name">PaddyMart</span>
            <span className="logo-tagline">Field Marketplace</span>
          </div>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <FiHome /> <span>Home</span>
          </Link>
          <Link to="/browse" className={`nav-link ${isActive('/browse') ? 'active' : ''}`}>
            <FiSearch /> <span>Browse Fields</span>
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                <FiGrid /> <span>Dashboard</span>
              </Link>
              {user.role === 'farmer' && (
                <Link to="/add-field" className={`nav-link ${isActive('/add-field') ? 'active' : ''}`}>
                  <FiPlusCircle /> <span>Add Field</span>
                </Link>
              )}
              <Link to="/chat" className={`nav-link ${isActive('/chat') ? 'active' : ''}`}>
                <FiMessageSquare /> <span>Messages</span>
              </Link>
            </>
          ) : null}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <button className="user-menu-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className={`user-role role-${user.role}`}>{user.role}</span>
                </div>
                <FiChevronDown className={`chevron ${dropdownOpen ? 'rotated' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu animate-fade-in-down">
                  <Link to="/profile" className="dropdown-item">
                    <FiUser /> Profile
                  </Link>
                  <Link to="/dashboard" className="dropdown-item">
                    <FiGrid /> Dashboard
                  </Link>
                  <Link to="/chat" className="dropdown-item">
                    <FiMessageSquare /> Messages
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Log In</Link>
              <Link to="/register" className="btn-register">Sign Up</Link>
            </div>
          )}

          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
