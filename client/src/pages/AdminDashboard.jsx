import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
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
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!localStorage.getItem('adminAuthenticated')) {
      navigate('/admin/login');
      return;
    }

    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
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
      const response = await fetch('/api/admin/change-password', {
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
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          <div className="admin-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>{stats?.totalProducts || 0}</h3>
                <p>Total Products</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <h3>{stats?.totalOrders || 0}</h3>
                <p>Total Orders</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>${(stats?.totalRevenue || 0).toFixed(2)}</h3>
                <p>Total Revenue</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h3>{stats?.lowStockProducts || 0}</h3>
                <p>Low Stock Items</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{stats?.pendingOrders || 0}</h3>
                <p>Pending Orders</p>
              </div>
            </div>
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

