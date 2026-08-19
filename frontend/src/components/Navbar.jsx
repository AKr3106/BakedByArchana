import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Sun, Moon, Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { count, setIsOpen: setCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo" onClick={() => setIsMobileMenuOpen(false)}>
            <img
              src="/logo.png"
              alt="Baked By Archana"
              className="navbar__logo-img"
            />
            <span className="navbar__brand">Baked By Archana</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="navbar__links main-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin/orders"
                className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                style={{ color: 'var(--accent)' }}
              >
                Admin Dashboard
              </NavLink>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="navbar__actions header-cta">
            {/* Theme toggle */}
            <button
              className="navbar__icon-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              id="theme-toggle"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </motion.div>
            </button>

            {/* Cart */}
            <button
              className="navbar__icon-btn navbar__cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              id="open-cart"
            >
              <ShoppingBag size={18} />
              {user && count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="badge navbar__badge"
                >
                  {count}
                </motion.span>
              )}
            </button>

            {/* Auth */}
            {loading ? (
              <div style={{ width: '80px', height: '36px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', opacity: 0.5 }}></div>
            ) : user ? (
              <div className="navbar__user-menu">
                <Link to="/profile" className="navbar__avatar" id="profile-link">
                  <span>{user.username?.[0]?.toUpperCase() || 'U'}</span>
                </Link>
                <button
                  className="navbar__icon-btn"
                  onClick={handleLogout}
                  aria-label="Logout"
                  id="logout-btn"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary" id="auth-link" style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}>
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className={`navbar__hamburger ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Mounted strictly inside header */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="mobile-menu__link"
              end={link.to === '/'}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin/orders"
              className="mobile-menu__link"
              style={{ color: 'var(--accent)' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin Dashboard
            </NavLink>
          )}
          {loading ? null : user ? (
            <>
              <div className="mobile-menu__user-info" style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Signed in as <strong style={{ color: 'var(--text-primary)' }}>@{user.username || 'user'}</strong></span>
              </div>
              <Link
                to="/profile"
                className="mobile-menu__link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Profile
              </Link>
              <button
                className="mobile-menu__link"
                style={{ textAlign: 'left', color: 'var(--pink-600)', background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="btn-primary mobile-menu__auth"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
