import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phonenumber: '',
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        navigate(from, { replace: true });
      } else {
        await register({
          username: form.username,
          email: form.email,
          password: form.password,
          phonenumber: form.phonenumber,
        });
        setSuccess('Account created! Please sign in.');
        setMode('login');
        setForm((f) => ({ ...f, username: '', phonenumber: '', password: '' }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  return (
    <div className="auth-page page-enter">
      {/* Decorative bg blobs */}
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />

      <div className="auth-container">
        {/* Left panel - branding */}
        <motion.div
          className="auth-brand"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <img src="/logo.png" alt="Baked By Archana" className="auth-brand__logo" />
          <h1 className="auth-brand__name">Baked By Archana</h1>
          <p className="auth-brand__tagline">
            Where every slice tells a story of love, craft, and celebration.
          </p>

          <div className="auth-brand__features">
            {['Handcrafted with love', 'Premium ingredients', 'Custom cake designs', 'Doorstep delivery'].map((f) => (
              <div key={f} className="auth-brand__feature">
                <CheckCircle size={16} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right panel - form */}
        <motion.div
          className="auth-card card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
              onClick={() => switchMode('login')}
              id="tab-login"
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'auth-tab--active' : ''}`}
              onClick={() => switchMode('register')}
              id="tab-register"
            >
              Create Account
            </button>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="auth-alert auth-alert--error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                className="auth-alert auth-alert--success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CheckCircle size={16} />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              className="auth-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
              transition={{ duration: 0.25 }}
            >
              {mode === 'register' && (
                <div className="input-group">
                  <label htmlFor="username">Username</label>
                  <div className="auth-input-wrap">
                    <User size={16} className="auth-input-icon" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      className="input-field auth-input"
                      placeholder="archana_bakes"
                      value={form.username}
                      onChange={handleChange}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <div className="auth-input-wrap">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="input-field auth-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="input-group">
                  <label htmlFor="phonenumber">Phone Number</label>
                  <div className="auth-input-wrap">
                    <Phone size={16} className="auth-input-icon" />
                    <input
                      id="phonenumber"
                      name="phonenumber"
                      type="tel"
                      className="input-field auth-input"
                      placeholder="+91 98765 43210"
                      value={form.phonenumber}
                      onChange={handleChange}
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field auth-input auth-input--password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                className="btn-primary auth-submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                id="auth-submit-btn"
              >
                {loading ? (
                  <span className="auth-spinner" />
                ) : mode === 'login' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </motion.button>

              <p className="auth-switch">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  className="auth-switch__link"
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                >
                  {mode === 'login' ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
