import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { GiWheat, GiFarmer, GiReceiveMoney } from 'react-icons/gi';
import '../Login/Auth.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', role: '', location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectRole = (role) => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = formData;
      const user = await register(data);
      toast.success(`Welcome to PaddyMart, ${user.name}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-shape shape-1"></div>
        <div className="auth-bg-shape shape-2"></div>
        <div className="auth-bg-shape shape-3"></div>
      </div>
      <div className="auth-container animate-fade-in-up">
        <div className="auth-card glass">
          <div className="auth-header">
            <div className="auth-logo">
              <GiWheat />
            </div>
            <h1>Create Account</h1>
            <p>Join PaddyMart today</p>
          </div>

          {step === 1 ? (
            <div className="role-selection">
              <h3>I want to...</h3>
              <div className="role-cards">
                <button className="role-card" onClick={() => selectRole('farmer')}>
                  <div className="role-icon role-farmer-icon"><GiFarmer /></div>
                  <h4>Sell Fields</h4>
                  <p>I'm a farmer and want to list my paddy fields for sale</p>
                </button>
                <button className="role-card" onClick={() => selectRole('buyer')}>
                  <div className="role-icon role-buyer-icon"><GiReceiveMoney /></div>
                  <h4>Buy Fields</h4>
                  <p>I want to browse and purchase paddy fields</p>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="selected-role">
                <span className={`role-tag role-${formData.role}`}>
                  {formData.role === 'farmer' ? <GiFarmer /> : <GiReceiveMoney />}
                  {formData.role === 'farmer' ? 'Farmer' : 'Buyer'}
                </span>
                <button type="button" className="change-role" onClick={() => setStep(1)}>Change</button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input type="text" id="name" name="name" placeholder="Your full name"
                      value={formData.name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="input-wrapper">
                    <FiPhone className="input-icon" />
                    <input type="tel" id="phone" name="phone" placeholder="Phone number"
                      value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email Address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input type="email" id="reg-email" name="email" placeholder="Enter your email"
                    value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <div className="input-wrapper">
                  <FiMapPin className="input-icon" />
                  <input type="text" id="location" name="location" placeholder="Your district/city"
                    value={formData.location} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reg-password">Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input type={showPassword ? 'text' : 'password'} id="reg-password" name="password"
                      placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required minLength={6} />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input type="password" id="confirmPassword" name="confirmPassword"
                      placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <div className="btn-loading"><div className="loading-spinner-sm"></div> Creating Account...</div>
                ) : (
                  <><FiUserPlus /> Create Account</>
                )}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Log In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
