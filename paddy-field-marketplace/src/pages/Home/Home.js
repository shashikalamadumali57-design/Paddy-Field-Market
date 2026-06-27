import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiArrowRight, FiUsers, FiMapPin, FiShield, FiMessageSquare, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { GiWheat, GiFarmer, GiReceiveMoney } from 'react-icons/gi';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-overlay"></div>
        <div className="hero-particles">
          <div className="particle p1">🌾</div>
          <div className="particle p2">🌱</div>
          <div className="particle p3">🍃</div>
          <div className="particle p4">🌿</div>
          <div className="particle p5">🌾</div>
        </div>
        <div className="container hero-content">
          <div className="hero-text animate-fade-in-up">
            <div className="hero-badge">
              <GiWheat /> Trusted Paddy Field Marketplace
            </div>
            <h1>
              Buy & Sell <br />
              <span className="gradient-text">Paddy Fields</span> <br />
              with Confidence
            </h1>
            <p className="hero-description">
              Connect directly with farmers and buyers. Browse paddy fields by size, location, 
              shape, and price. Chat in real-time and make deals with trust.
            </p>
            <div className="hero-actions">
              {user ? (
                <>
                  <Link to="/browse" className="btn-primary-lg">
                    <FiSearch /> Browse Fields
                  </Link>
                  <Link to="/dashboard" className="btn-outline-lg">
                    Go to Dashboard <FiArrowRight />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-primary-lg">
                    Get Started <FiArrowRight />
                  </Link>
                  <Link to="/browse" className="btn-outline-lg">
                    <FiSearch /> Browse Fields
                  </Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Fields Listed</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">1,200+</span>
                <span className="stat-label">Happy Users</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">25+</span>
                <span className="stat-label">Districts</span>
              </div>
            </div>
          </div>
          <div className="hero-visual animate-fade-in">
            <div className="hero-card-stack">
              <div className="hero-field-card hfc-1">
                <div className="hfc-img">🌾</div>
                <div className="hfc-info">
                  <span className="hfc-title">5 Acre Paddy Field</span>
                  <span className="hfc-price">Rs. 2.5M</span>
                  <span className="hfc-loc"><FiMapPin /> Anuradhapura</span>
                </div>
              </div>
              <div className="hero-field-card hfc-2">
                <div className="hfc-img">🌱</div>
                <div className="hfc-info">
                  <span className="hfc-title">3 Acre Premium Land</span>
                  <span className="hfc-price">Rs. 1.8M</span>
                  <span className="hfc-loc"><FiMapPin /> Polonnaruwa</span>
                </div>
              </div>
              <div className="hero-field-card hfc-3">
                <div className="hfc-img">🍃</div>
                <div className="hfc-info">
                  <span className="hfc-title">8 Acre Irrigated Land</span>
                  <span className="hfc-price">Rs. 4.2M</span>
                  <span className="hfc-loc"><FiMapPin /> Kurunegala</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header animate-fade-in-up">
            <span className="section-tag">Simple Process</span>
            <h2>How It Works</h2>
            <p>Get started in just a few simple steps</p>
          </div>
          <div className="steps-grid">
            <Link to={user ? "/profile" : "/register"} className="step-card animate-fade-in-up delay-1" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="step-number">01</div>
              <div className="step-icon"><FiUsers /></div>
              <h3>Create Account</h3>
              <p>Register as a farmer to sell your fields or as a buyer to browse and purchase</p>
            </Link>
            <Link to="/browse" className="step-card animate-fade-in-up delay-2" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="step-number">02</div>
              <div className="step-icon"><FiMapPin /></div>
              <h3>List or Browse</h3>
              <p>Farmers add field details with size, shape, location & price. Buyers search & filter</p>
            </Link>
            <Link to="/chat" className="step-card animate-fade-in-up delay-3" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="step-number">03</div>
              <div className="step-icon"><FiMessageSquare /></div>
              <h3>Chat & Connect</h3>
              <p>Chat directly with interested parties in real-time to negotiate and discuss</p>
            </Link>
            <Link to="/dashboard" className="step-card animate-fade-in-up delay-4" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="step-number">04</div>
              <div className="step-icon"><FiCheckCircle /></div>
              <h3>Close the Deal</h3>
              <p>Finalize the transaction with confidence through our trusted platform</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="section-header animate-fade-in-up">
            <span className="section-tag">Why Choose Us</span>
            <h2>Features You'll Love</h2>
            <p>Everything you need for hassle-free paddy field transactions</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon fi-green"><GiFarmer /></div>
              <h3>For Farmers</h3>
              <p>List your paddy fields with detailed information. Reach thousands of potential buyers instantly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon fi-gold"><GiReceiveMoney /></div>
              <h3>For Buyers</h3>
              <p>Browse verified field listings. Filter by location, size, shape, and price to find your perfect field.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon fi-blue"><FiMessageSquare /></div>
              <h3>Real-time Chat</h3>
              <p>Communicate directly with sellers or buyers through our built-in messaging system.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon fi-purple"><FiShield /></div>
              <h3>Secure & Trusted</h3>
              <p>Verified user accounts and secure authentication to protect your transactions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to Get Started?</h2>
              <p>Join thousands of farmers and buyers already using PaddyMart</p>
              <div className="cta-actions">
                <Link to="/register" className="btn-primary-lg">
                  Create Free Account <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
