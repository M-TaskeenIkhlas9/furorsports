import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

