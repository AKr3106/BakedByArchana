import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Calendar, Check, X, AlertCircle, MapPin, CreditCard, Banknote, ChevronDown } from 'lucide-react';
import './AdminOrders.css';

const TABS = ['All Orders', 'Cancellation Requests'];
const STATUSES = ['All', 'Processing', 'Baking', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const res = await fetch('/api/orders/admin/all', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
      setOrders(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm(`Change order status to ${newStatus}?`)) return;
    setProcessingId(orderId);
    try {
      const res = await fetch(`/api/orders/admin/status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      
      setOrders(prev => prev.map(o => o._id === orderId ? data.data : o));
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancellationAction = async (orderId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this cancellation request?`)) return;
    setProcessingId(orderId);
    try {
      const res = await fetch(`/api/orders/admin/handle-cancellation/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${action} request`);
      
      // We expect the backend to return the fully updated order document
      setOrders(prev => prev.map(o => o._id === orderId ? data.data : o));
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // ── Derived State (Filtering) ──
  const visibleOrders = useMemo(() => {
    let list = orders;
    
    // Tab Filter
    if (activeTab === 'Cancellation Requests') {
      list = list.filter(o => o.cancellationRequest?.status === 'Pending');
    }
    
    // Status Filter (Only if we are in All Orders, otherwise ignore to show all pending cancellations)
    if (activeTab === 'All Orders' && statusFilter !== 'All') {
      list = list.filter(o => (o.orderStatus || o.status) === statusFilter);
    }
    
    return list;
  }, [orders, activeTab, statusFilter]);

  const pendingCount = orders.filter(o => o.cancellationRequest?.status === 'Pending').length;

  return (
    <div className="admin-orders page-enter">
      <div className="container">
        
        {/* Header & Tabs */}
        <div className="admin-orders__header-wrap">
          <motion.div 
            className="admin-orders__header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>Order Management</h1>
            <p>Manage all customer orders and process cancellations.</p>
          </motion.div>

          <div className="admin-tabs">
            {TABS.map(tab => (
              <button 
                key={tab} 
                className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab); setStatusFilter('All'); }}
              >
                {tab === 'Cancellation Requests' && pendingCount > 0 && (
                  <span className="admin-tab__badge">{pendingCount}</span>
                )}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Filters (Only show on 'All Orders' tab) */}
        {activeTab === 'All Orders' && (
          <div className="status-filters">
            {STATUSES.map(s => (
              <button 
                key={s} 
                className={`status-pill ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="loading-state">
            <div className="skeleton" style={{ height: 160, borderRadius: 12, marginBottom: '1.5rem' }}></div>
            <div className="skeleton" style={{ height: 160, borderRadius: 12 }}></div>
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="empty-state">
            <Check size={48} />
            <h3>No Orders Found</h3>
            <p>There are no orders matching your current filters.</p>
          </div>
        ) : (
          <div className="orders-grid">
            <AnimatePresence mode="popLayout">
              {visibleOrders.map(order => {
                const currentStatus = order.orderStatus || order.status || 'Processing';
                const hasPendingCancel = order.cancellationRequest?.status === 'Pending';
                const isPaid = order.paymentStatus === 'Paid';

                return (
                  <motion.div 
                    key={order._id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.25 }}
                    className="order-card card"
                  >
                    {/* --- Order Header --- */}
                    <div className="order-card__header">
                      <div className="order-card__id-date">
                        <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                        <span className="order-date">
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleString('en-IN', { 
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      
                      <div className="order-card__status-selector">
                        <select 
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={processingId === order._id || currentStatus === 'Cancelled'}
                          className={`status-select status--${currentStatus.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {STATUSES.filter(s => s !== 'All').map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="select-icon" />
                      </div>
                    </div>

                    {/* --- Order Details Grid --- */}
                    <div className="order-card__details">
                      {/* Customer Info */}
                      <div className="detail-group">
                        <strong>Customer</strong>
                        <div><User size={14} /> {order.userId?.username || 'Unknown User'}</div>
                        <div><Mail size={14} /> {order.userId?.email || 'N/A'}</div>
                        {(order.userId?.phonenumber || order.shippingAddress?.phone) && (
                          <div><Phone size={14} /> {order.shippingAddress?.phone || order.userId.phonenumber}</div>
                        )}
                      </div>

                      {/* Delivery Address */}
                      <div className="detail-group">
                        <strong>Delivery Address</strong>
                        <div className="address-box">
                          <MapPin size={14} className="address-icon" />
                          <span>
                            {order.shippingAddress?.fullName}<br/>
                            {order.shippingAddress?.street}, {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}
                          </span>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="detail-group">
                        <strong>Payment</strong>
                        <div className="payment-info">
                          {order.paymentMethod === 'Online' ? <CreditCard size={14} /> : <Banknote size={14} />}
                          <span>{order.paymentMethod === 'Online' ? 'Online' : 'Cash on Delivery'}</span>
                          <span className={`payment-status payment--${isPaid ? 'paid' : 'pending'}`}>
                            {isPaid ? 'PAID' : 'PENDING'}
                          </span>
                        </div>
                        <div className="order-total-large">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* --- Items List --- */}
                    <div className="order-card__items">
                      <strong>Items ({order.items.reduce((s, i) => s + i.quantity, 0)})</strong>
                      <ul className="items-list">
                        {order.items.map((item, i) => (
                          <li key={i} className="item-row">
                            <img src={item.imageUrl || item.url || '/placeholder-cake.png'} alt={item.name} onError={e => e.target.src = '/logo.png'} />
                            <div className="item-info">
                              <span className="item-name">{item.name}</span>
                              <span className="item-qty-price">{item.quantity} × ₹{item.price.toLocaleString('en-IN')}</span>
                            </div>
                            <span className="item-subtotal">₹{(item.quantity * item.price).toLocaleString('en-IN')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* --- Cancellation Request Alert --- */}
                    {hasPendingCancel && (
                      <div className="cancellation-alert">
                        <div className="cancellation-alert__header">
                          <AlertCircle size={16} />
                          <strong>Cancellation Requested</strong>
                        </div>
                        <p>"{order.cancellationRequest.reason || 'No reason provided.'}"</p>
                        <div className="cancellation-alert__actions">
                          <button 
                            className="btn-danger btn-sm"
                            disabled={processingId === order._id}
                            onClick={() => handleCancellationAction(order._id, 'approve')}
                          >
                            <Check size={14} /> Approve (Cancel Order)
                          </button>
                          <button 
                            className="btn-secondary btn-sm"
                            disabled={processingId === order._id}
                            onClick={() => handleCancellationAction(order._id, 'reject')}
                          >
                            <X size={14} /> Reject Request
                          </button>
                        </div>
                      </div>
                    )}

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
