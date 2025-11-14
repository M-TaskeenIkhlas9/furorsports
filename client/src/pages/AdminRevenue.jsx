import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminRevenue.css';

const AdminRevenue = () => {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [period, setPeriod] = useState('daily');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get current month and year for default
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    if (!localStorage.getItem('adminAuthenticated')) {
      navigate('/admin/login');
      return;
    }

    fetchData();
  }, [navigate, period, selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('period', period);
      if (selectedMonth && selectedYear) {
        params.append('month', selectedMonth);
        params.append('year', selectedYear);
      }
      
      const [summaryRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/revenue/summary?${params.toString()}`),
        fetch(`/api/admin/revenue/analytics?${params.toString()}`)
      ]);

      const summaryData = await summaryRes.json();
      const analyticsData = await analyticsRes.json();

      setSummary(summaryData);
      // Reverse to show oldest to newest
      setAnalytics(analyticsData.reverse());
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate month options (last 12 months)
  const getMonthOptions = () => {
    const months = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      months.push({
        value: `${year}-${String(month).padStart(2, '0')}`,
        label: `${monthNames[month - 1]} ${year}`,
        month,
        year
      });
    }
    return months;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return <div className="admin-revenue-loading">Loading...</div>;
  }

  return (
    <div className="admin-revenue">
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <h1>Revenue Analytics</h1>
            <div className="admin-header-actions">
              <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">
                ← Back to Dashboard
              </button>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          {/* Summary Cards */}
          <div className="revenue-summary-grid">
            <div className="summary-card">
              <div className="summary-icon">💰</div>
              <div className="summary-info">
                <h3 title={formatCurrency(summary?.total?.revenue || 0)}>
                  {formatCurrency(summary?.total?.revenue || 0)}
                </h3>
                <p>TOTAL REVENUE</p>
                <span className="summary-subtitle">{summary?.total?.orders || 0} orders</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">📅</div>
              <div className="summary-info">
                <h3 title={formatCurrency(summary?.month?.revenue || 0)}>
                  {formatCurrency(summary?.month?.revenue || 0)}
                </h3>
                <p>{selectedMonth && selectedYear ? 'SELECTED MONTH' : 'THIS MONTH'}</p>
                <span className="summary-subtitle">{summary?.month?.orders || 0} orders</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">📊</div>
              <div className="summary-info">
                <h3 title={formatCurrency(summary?.week?.revenue || 0)}>
                  {formatCurrency(summary?.week?.revenue || 0)}
                </h3>
                <p>THIS WEEK</p>
                <span className="summary-subtitle">{summary?.week?.orders || 0} orders</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">⚡</div>
              <div className="summary-info">
                <h3 title={formatCurrency(summary?.today?.revenue || 0)}>
                  {formatCurrency(summary?.today?.revenue || 0)}
                </h3>
                <p>TODAY</p>
                <span className="summary-subtitle">{summary?.today?.orders || 0} orders</span>
              </div>
            </div>
          </div>

          {/* Period and Month Selector */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div className="period-selector" style={{ flex: '1', minWidth: '200px' }}>
              <button
                className={period === 'daily' ? 'active' : ''}
                onClick={() => setPeriod('daily')}
              >
                Daily
              </button>
              <button
                className={period === 'weekly' ? 'active' : ''}
                onClick={() => setPeriod('weekly')}
              >
                Weekly
              </button>
              <button
                className={period === 'monthly' ? 'active' : ''}
                onClick={() => setPeriod('monthly')}
              >
                Monthly
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ color: 'rgba(203, 213, 225, 0.9)', fontSize: '0.9rem' }}>Select Month:</label>
              <select
                value={selectedMonth && selectedYear ? `${selectedYear}-${String(selectedMonth).padStart(2, '0')}` : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month] = e.target.value.split('-');
                    setSelectedMonth(month);
                    setSelectedYear(year);
                  } else {
                    setSelectedMonth('');
                    setSelectedYear('');
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">Current Month</option>
                {getMonthOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="chart-card">
              <h2>Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.2)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(203, 213, 225, 0.8)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="rgba(203, 213, 225, 0.8)"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h2>Orders & Revenue</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.2)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(203, 213, 225, 0.8)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="rgba(203, 213, 225, 0.8)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value, name) => {
                      if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                      return [value, 'Orders'];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    fill="#3b82f6" 
                    name="Revenue ($)"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="#8b5cf6" 
                    name="Orders"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Revenue Data Table */}
          <div className="revenue-table-card">
            <h2>Revenue Details</h2>
            <div className="revenue-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Revenue</th>
                    <th>Orders</th>
                    <th>Average Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="no-data">No revenue data available</td>
                    </tr>
                  ) : (
                    analytics.map((item, index) => (
                      <tr key={index}>
                        <td>{item.date}</td>
                        <td className="revenue-amount">${(item.revenue || 0).toFixed(2)}</td>
                        <td>{item.orders || 0}</td>
                        <td className="avg-order">
                          ${item.orders > 0 ? (item.revenue / item.orders).toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;

