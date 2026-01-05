import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const bellRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!localStorage.getItem('adminAuthenticated')) {
      navigate('/admin/login');
      return;
    }

    fetchStats();
    fetchRecentOrders();
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const notificationInterval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);
    
    // Close notifications when clicking outside
    const handleClickOutside = (event) => {
      if (showNotifications && 
          bellRef.current &&
          !bellRef.current.contains(event.target) && 
          !event.target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(notificationInterval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate, showNotifications]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/orders`);
      const data = await response.json();
      // Get last 10 orders
      setRecentOrders(data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/notifications`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/notifications/unread-count`);
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/api/admin/notifications/${id}/read`, { method: 'PUT' });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/api/admin/notifications/read-all`, { method: 'PUT' });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    
    setChangingPassword(true);
    
    try {
      const response = await fetch(`${API_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setShowPasswordChange(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <div className="admin-dashboard-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <h1>Admin Dashboard</h1>
            <div className="admin-header-actions">
              <div className="notifications-container">
                <button 
                  ref={bellRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (bellRef.current) {
                      const rect = bellRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + 10,
                        right: window.innerWidth - rect.right
                      });
                    }
                    setShowNotifications(!showNotifications);
                  }} 
                  className="notification-bell"
                  title="Notifications"
                >
                  🔔
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
                {showNotifications && createPortal(
                  <div 
                    className="notifications-dropdown"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      right: `${dropdownPosition.right}px`
                    }}
                  >
                    <div className="notifications-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="mark-all-read">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="notifications-list">
                      {notifications.length === 0 ? (
                        <p className="no-notifications">No notifications</p>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                            onClick={() => {
                              if (!notif.read) markAsRead(notif.id);
                              if (notif.order_id) navigate('/admin/orders');
                            }}
                          >
                            <div className="notification-content">
                              <h4>{notif.title}</h4>
                              <p>{notif.message}</p>
                              <span className="notification-time">
                                {new Date(notif.created_at).toLocaleString()}
                              </span>
                            </div>
                            {!notif.read && <div className="unread-indicator"></div>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>,
                  document.body
                )}
              </div>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          <div className="admin-stats-grid">
            <div 
              className="stat-card clickable"
              onClick={() => navigate('/admin/products')}
              title="Click to view all products"
            >
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>{stats?.totalProducts || 0}</h3>
                <p>Total Products</p>
              </div>
            </div>

            <div 
              className="stat-card clickable"
              onClick={() => navigate('/admin/orders')}
              title="Click to view all orders"
            >
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <h3>{stats?.totalOrders || 0}</h3>
                <p>Total Orders</p>
              </div>
            </div>

            <div 
              className="stat-card clickable"
              onClick={() => navigate('/admin/revenue')}
              title="Click to view revenue analytics"
            >
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>${(stats?.totalRevenue || 0).toFixed(2)}</h3>
                <p>Total Revenue</p>
              </div>
            </div>

            <div 
              className="stat-card clickable"
              onClick={() => navigate('/admin/products?filter=low-stock')}
              title="Click to view low stock items"
            >
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h3>{stats?.lowStockProducts || 0}</h3>
                <p>Low Stock Items</p>
              </div>
            </div>

            <div 
              className="stat-card clickable"
              onClick={() => navigate('/admin/orders?status=processing')}
              title="Click to view non-shipped orders"
            >
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>{stats?.nonShippedOrders || 0}</h3>
                <p>Non-Shipped Orders</p>
              </div>
            </div>

            <div 
              className="stat-card clickable"
              onClick={() => navigate('/admin/orders?filter=non-delivered')}
              title="Click to view non-delivered orders"
            >
              <div className="stat-icon">🚚</div>
              <div className="stat-info">
                <h3>{stats?.nonDeliveredOrders || 0}</h3>
                <p>Non-Delivered Orders</p>
              </div>
            </div>
          </div>

          <div className="recent-orders-section">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <button 
                onClick={() => navigate('/admin/orders')} 
                className="btn btn-outline"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                View All Orders →
              </button>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="no-orders-message">
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="recent-orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td className="order-number-cell">{order.order_number}</td>
                        <td>{order.customer_name}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="amount-cell">${order.total_amount?.toFixed(2) || '0.00'}</td>
                        <td>
                          <span 
                            className="status-badge-small"
                            style={{ 
                              backgroundColor: order.status === 'delivered' ? '#10b981' :
                                              order.status === 'processing' ? '#3b82f6' :
                                              order.status === 'shipped' ? '#8b5cf6' :
                                              order.status === 'cancelled' ? '#ef4444' : '#f59e0b'
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => navigate(`/admin/orders?order=${order.order_number}`)}
                            className="btn-view-small"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button 
                onClick={() => navigate('/admin/products')} 
                className="btn btn-primary"
              >
                Manage Products
              </button>
              <button 
                onClick={() => navigate('/admin/orders')} 
                className="btn btn-primary"
              >
                View Orders
              </button>
              <button 
                onClick={() => navigate('/admin/products/add')} 
                className="btn btn-primary"
              >
                Add New Product
              </button>
              <button 
                onClick={() => navigate('/admin/categories')} 
                className="btn btn-primary"
              >
                Manage Categories
              </button>
              <button 
                onClick={() => navigate('/admin/customers')} 
                className="btn btn-primary"
              >
                View Customers
              </button>
              <button 
                onClick={() => setShowPasswordChange(!showPasswordChange)} 
                className="btn btn-secondary"
              >
                {showPasswordChange ? 'Cancel' : 'Change Password'}
              </button>
            </div>
          </div>

          {showPasswordChange && (
            <div className="password-change-section">
              <div className="password-change-card">
                <h3>Change Password</h3>
                <form onSubmit={handlePasswordChange} className="password-change-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      placeholder="Enter new password (min 6 characters)"
                      minLength={6}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      placeholder="Confirm new password"
                      minLength={6}
                    />
                  </div>
                  
                  {passwordError && <div className="error-message">{passwordError}</div>}
                  {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

