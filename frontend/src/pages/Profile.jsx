import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Shield, Trash2, AlertTriangle, Package, Calendar, X, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

// Real orders fetched from backend
// (No longer using MOCK_ORDERS)

export default function Profile() {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [activeCancelOrder, setActiveCancelOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/my-history', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch history');
        setOrders(data.data);
      } catch (err) {
        setErrorOrders(err.message);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const handleRequestCancel = async () => {
    if (!activeCancelOrder || !cancelReason.trim()) return;
    setCancelLoading(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/orders/request-cancel/${activeCancelOrder._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to request cancellation');
      
      // Update local state
      setOrders(orders.map(o => o._id === activeCancelOrder._id ? data.data : o));
      setCancelModalOpen(false);
      setCancelReason('');
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const openCancelModal = (order) => {
    setActiveCancelOrder(order);
    setCancelReason('');
    setCancelError('');
    setCancelModalOpen(true);
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      setDeleteError(err.message);
      setDeleteLoading(false);
    }
  };

  return (
    <div className="profile-page page-enter">
      <div className="container profile-container">
        {/* Header */}
        <motion.div
          className="profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="profile-avatar">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="profile-name">{user?.username}</h1>
            <span className={`profile-role-badge ${user?.role === 'admin' ? 'profile-role-badge--admin' : ''}`}>
              <Shield size={12} />
              {user?.role === 'admin' ? 'Administrator' : 'Customer'}
            </span>
          </div>
        </motion.div>

        <div className="profile-grid">
          {/* Account Details */}
          <motion.section
            className="card profile-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <h2 className="profile-section__title">Account Details</h2>
            <ul className="profile-details-list">
              <li className="profile-detail">
                <User size={16} />
                <div>
                  <span className="profile-detail__label">Username</span>
                  <span className="profile-detail__value">{user?.username}</span>
                </div>
              </li>
              <li className="profile-detail">
                <Mail size={16} />
                <div>
                  <span className="profile-detail__label">Email Address</span>
                  <span className="profile-detail__value">{user?.email}</span>
                </div>
              </li>
              {user?.phonenumber && (
                <li className="profile-detail">
                  <Phone size={16} />
                  <div>
                    <span className="profile-detail__label">Phone Number</span>
                    <span className="profile-detail__value">{user.phonenumber}</span>
                  </div>
                </li>
              )}
              <li className="profile-detail">
                <Calendar size={16} />
                <div>
                  <span className="profile-detail__label">Member Since</span>
                  <span className="profile-detail__value">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </li>
            </ul>
          </motion.section>

          {/* Order History */}
          <motion.section
            className="card profile-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <h2 className="profile-section__title">
              <Package size={18} /> Order History
            </h2>
            {loadingOrders ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>Loading orders...</p>
            ) : errorOrders ? (
              <p style={{ color: 'red', fontSize: '0.9rem', padding: '1rem 0' }}>{errorOrders}</p>
            ) : orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>No orders yet.</p>
            ) : (
              <ul className="orders-list">
                {orders.map((order) => (
                  <li key={order._id} className="order-item">
                    <div className="order-item__info">
                      <p className="order-item__name">
                        {order.items.length > 0 ? order.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : 'Custom Order'}
                      </p>
                      <p className="order-item__meta">
                        {order._id} · {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="order-item__right">
                      <span className="order-item__price">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      <span className={`order-item__status order-item__status--${(order.orderStatus || order.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.orderStatus || order.status || 'Unknown'}
                      </span>
                    </div>
                  
                  {/* Cancellation Row */}
                  {(order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled') && (
                    <div className="order-item__actions">
                      {order.cancellationRequest?.status === 'Pending' && (
                        <div className="cancel-badge cancel-badge--pending">
                          <Clock size={14} /> Cancellation Pending Approval
                        </div>
                      )}
                      {order.cancellationRequest?.status === 'Rejected' && (
                        <div className="cancel-badge cancel-badge--rejected">
                          <XCircle size={14} /> Cancellation Request Rejected
                        </div>
                      )}
                      {(!order.cancellationRequest || order.cancellationRequest.status === 'None') && (
                        <button className="btn-secondary btn-sm" onClick={() => openCancelModal(order)}>
                          Request Cancellation
                        </button>
                      )}
                    </div>
                  )}
                  </li>
                ))}
              </ul>
            )}
          </motion.section>

          {/* Danger Zone */}
          <motion.section
            className="card profile-section profile-section--danger"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className="profile-section__title profile-section__title--danger">
              <AlertTriangle size={18} /> Danger Zone
            </h2>
            <p className="danger-desc">
              Permanently delete your account and all associated data. This action is irreversible.
            </p>
            {!showDeleteConfirm ? (
              <button
                className="btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
                id="delete-account-btn"
              >
                <Trash2 size={16} /> Delete My Account
              </button>
            ) : (
              <div className="delete-confirm">
                <p className="delete-confirm__text">
                  Are you absolutely sure? This will permanently erase your account.
                </p>
                {deleteError && <p className="delete-confirm__error">{deleteError}</p>}
                <div className="delete-confirm__actions">
                  <button
                    className="btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    id="confirm-delete-btn"
                  >
                    {deleteLoading ? 'Deleting…' : 'Yes, Delete Account'}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }}
                    id="cancel-delete-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.section>
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="modal-overlay" onClick={() => setCancelModalOpen(false)}>
          <motion.div 
            className="modal-content cancel-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Request Order Cancellation</h3>
              <button className="modal-close" onClick={() => setCancelModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Please provide a reason for cancelling Order <strong>#{activeCancelOrder?._id?.slice(-8).toUpperCase()}</strong>.</p>
              <textarea 
                className="input-field" 
                rows="4" 
                placeholder="I made a mistake in the delivery address..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ marginTop: '1rem', resize: 'vertical' }}
              />
              {cancelError && <p className="error-text" style={{ marginTop: '0.5rem' }}>{cancelError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setCancelModalOpen(false)}>Cancel</button>
              <button 
                className="btn-danger" 
                onClick={handleRequestCancel}
                disabled={cancelLoading || !cancelReason.trim()}
              >
                {cancelLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
