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

  useEffect(() => {
    if (cancelModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [cancelModalOpen]);

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setCancelModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-amber-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8 space-y-4 overflow-visible"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
              onClick={() => setCancelModalOpen(false)}
            >
              <X size={20} />
            </button>

            {/* Header (Fixed Title Color & Added Top Padding) */}
            <div className="pt-2">
              <h3 className="text-lg sm:text-xl font-bold block mb-2 leading-tight" style={{ color: '#fef9f5' }}>
                Request Order Cancellation
              </h3>
              <span className="inline-block px-2.5! py-1! text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                #{activeCancelOrder?._id?.slice(-8).toUpperCase()}
              </span>
            </div>

            {/* Body */}
            <div>
              <p className="text-xs sm:text-sm text-zinc-300!  mb-3!">
                Please provide a reason for cancelling this order:
              </p>
              <textarea
                className="w-full p-4! text-sm rounded-xl border border-amber-200 dark:border-zinc-700 bg-amber-50/30 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-400 focus:outline-none resize-none min-h-30 transition-all"
                placeholder="I made a mistake in the delivery address..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              {cancelError && (
                <p className="mt-2 text-xs text-rose-500 font-medium">
                  {cancelError}
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 w-full">
              <button
                type="button"
                className="px-4! py-2! text-xs sm:text-sm font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                onClick={() => setCancelModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-6! py-2! m-1! text-xs sm:text-sm font-semibold rounded-xl bg-rose-500 text-white hover:bg-rose-600 shadow-sm active:scale-95 disabled:opacity-50 transition-all"
                onClick={handleRequestCancel}
                disabled={cancelLoading || !cancelReason.trim()}
              >
                {cancelLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
