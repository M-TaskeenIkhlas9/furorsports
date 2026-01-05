import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import './AdminCustomers.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminAuthenticated')) {
      navigate('/admin/login');
      return;
    }
    fetchCustomers();
  }, [navigate]);

  useEffect(() => {
    // Filter customers based on search term
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => {
        const search = searchTerm.toLowerCase();
        return (
          customer.name?.toLowerCase().includes(search) ||
          customer.email?.toLowerCase().includes(search) ||
          customer.phone?.toLowerCase().includes(search) ||
          customer.city?.toLowerCase().includes(search) ||
          customer.country?.toLowerCase().includes(search)
        );
      });
      setFilteredCustomers(filtered);
    }
  }, [customers, searchTerm]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/customers`);
      const data = await response.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/customers/${encodeURIComponent(email)}`);
      const data = await response.json();
      setSelectedCustomer(data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    setLoadingOrderDetails(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const data = await response.json();
      setSelectedOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Failed to load order details');
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const closeOrderDetails = () => {
    setSelectedOrderDetails(null);
  };

  if (loading) {
    return (
      <div className="admin-customers-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-customers-page">
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div>
              <h1 className="admin-title">CUSTOMER MANAGEMENT</h1>
              <p className="admin-subtitle">View and manage customer information</p>
            </div>
            <button onClick={() => navigate('/admin/dashboard')} className="btn btn-outline">
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          <div className="customers-layout">
            <div className="customers-list">
              <div className="customers-header">
                <h2>All Customers ({filteredCustomers.length})</h2>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search customers by name, email, phone, city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>
              </div>

              <div className="customers-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Orders</th>
                      <th>Total Spent</th>
                      <th>Last Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="no-customers">No customers found</td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer, index) => (
                        <tr 
                          key={index}
                          className={selectedCustomer?.email === customer.email ? 'selected' : ''}
                          onClick={() => fetchCustomerDetails(customer.email)}
                        >
                          <td className="customer-name">{customer.name}</td>
                          <td className="customer-email">{customer.email}</td>
                          <td>{customer.phone || 'N/A'}</td>
                          <td>{customer.city}, {customer.country}</td>
                          <td className="orders-count">{customer.total_orders}</td>
                          <td className="total-spent">${customer.total_spent?.toFixed(2) || '0.00'}</td>
                          <td>{customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchCustomerDetails(customer.email);
                              }}
                              className="btn-view"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedCustomer && (
              <div className="customer-details">
                <div className="customer-details-header">
                  <h2>Customer Details</h2>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="btn-close"
                  >
                    ×
                  </button>
                </div>

                <div className="customer-details-content">
                  <div className="customer-info-section">
                  <h3>Customer Information</h3>
                  <div className="info-grid">
                    <div className="info-item full-width">
                      <label>Name</label>
                      <span className="customer-name">{selectedCustomer.customer_name}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Email</label>
                      <span className="customer-email">{selectedCustomer.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <span>{selectedCustomer.phone || 'N/A'}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Address</label>
                      <span className="customer-address">
                        {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.country}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="customer-info-section">
                  <h3>Customer Statistics</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Total Orders</label>
                      <span className="stat-value">{selectedCustomer.total_orders}</span>
                    </div>
                    <div className="info-item">
                      <label>Total Spent</label>
                      <span className="stat-value amount">${selectedCustomer.total_spent?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="info-item">
                      <label>First Order</label>
                      <span>{selectedCustomer.first_order_date ? new Date(selectedCustomer.first_order_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Last Order</label>
                      <span>{selectedCustomer.last_order_date ? new Date(selectedCustomer.last_order_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="customer-info-section">
                  <h3>Order History</h3>
                  <div className="orders-list">
                    {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                      selectedCustomer.orders.map((order) => (
                        <div key={order.id} className="order-card">
                          <div className="order-card-header">
                            <span className="order-number">{order.order_number}</span>
                            <span 
                              className="status-badge"
                              style={{ 
                                backgroundColor: order.status === 'delivered' ? '#10b981' :
                                                order.status === 'processing' ? '#3b82f6' :
                                                order.status === 'shipped' ? '#8b5cf6' :
                                                order.status === 'cancelled' ? '#ef4444' : '#f59e0b'
                              }}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="order-card-body">
                            <div className="order-info-row">
                              <span>Date:</span>
                              <span>{new Date(order.created_at).toLocaleString()}</span>
                            </div>
                            <div className="order-info-row">
                              <span>Amount:</span>
                              <span className="amount">${order.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="order-info-row">
                              <span>Payment:</span>
                              <span className={`payment-status ${order.payment_status}`}>
                                {order.payment_status}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => fetchOrderDetails(order.id)}
                            className="btn-view-small"
                            disabled={loadingOrderDetails}
                          >
                            {loadingOrderDetails ? 'Loading...' : 'View Order Details'}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="no-orders">No orders found</p>
                    )}
                  </div>
                </div>
                </div>
              </div>
            )}

            {/* Order Details Modal */}
            {selectedOrderDetails && (
              <div className="order-details-modal-overlay" onClick={closeOrderDetails}>
                <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="order-details-modal-header">
                    <h2>Order #{selectedOrderDetails.order_number}</h2>
                    <button onClick={closeOrderDetails} className="btn-close-modal">×</button>
                  </div>
                  
                  <div className="order-details-modal-content">
                    {/* Order Information */}
                    <div className="order-details-section">
                      <h3>Order Information</h3>
                      <div className="order-info-grid">
                        <div className="order-info-item">
                          <label>Order Number</label>
                          <span>{selectedOrderDetails.order_number}</span>
                        </div>
                        <div className="order-info-item">
                          <label>Date</label>
                          <span>{new Date(selectedOrderDetails.created_at).toLocaleString()}</span>
                        </div>
                        <div className="order-info-item">
                          <label>Status</label>
                          <span 
                            className="status-badge"
                            style={{ 
                              backgroundColor: selectedOrderDetails.status === 'delivered' ? '#10b981' :
                                              selectedOrderDetails.status === 'processing' ? '#3b82f6' :
                                              selectedOrderDetails.status === 'shipped' ? '#8b5cf6' :
                                              selectedOrderDetails.status === 'cancelled' ? '#ef4444' : '#f59e0b'
                            }}
                          >
                            {selectedOrderDetails.status}
                          </span>
                        </div>
                        <div className="order-info-item">
                          <label>Payment Status</label>
                          <span className={`payment-status ${selectedOrderDetails.payment_status}`}>
                            {selectedOrderDetails.payment_status}
                          </span>
                        </div>
                        <div className="order-info-item">
                          <label>Total Amount</label>
                          <span className="total-amount">${selectedOrderDetails.total_amount?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="order-details-section">
                      <h3>Customer Information</h3>
                      <div className="order-info-grid">
                        <div className="order-info-item full-width">
                          <label>Name</label>
                          <span>{selectedOrderDetails.customer_name}</span>
                        </div>
                        <div className="order-info-item">
                          <label>Email</label>
                          <span>{selectedOrderDetails.email}</span>
                        </div>
                        <div className="order-info-item">
                          <label>Phone</label>
                          <span>{selectedOrderDetails.phone || 'N/A'}</span>
                        </div>
                        <div className="order-info-item full-width">
                          <label>Address</label>
                          <span>{selectedOrderDetails.address}, {selectedOrderDetails.city}, {selectedOrderDetails.country}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="order-details-section">
                      <h3>Order Items ({selectedOrderDetails.items?.length || 0})</h3>
                      <div className="order-items-list">
                        {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                          selectedOrderDetails.items.map((item, index) => {
                            let imageUrl = item.image || 'https://via.placeholder.com/80?text=No+Image';
                            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                              imageUrl = window.location.origin + imageUrl;
                            }
                            
                            return (
                              <div key={item.id || index} className="order-item-detail">
                                <div className="order-item-image-container">
                                  <img 
                                    src={imageUrl} 
                                    alt={item.name}
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                                    }}
                                  />
                                </div>
                                <div className="order-item-info">
                                  <h4>{item.name}</h4>
                                  <div className="order-item-details-row">
                                    <span>Quantity: <strong>{item.quantity}</strong></span>
                                    <span>Price: <strong>${item.price?.toFixed(2)}</strong></span>
                                    <span>Subtotal: <strong>${((item.quantity || 1) * (item.price || 0)).toFixed(2)}</strong></span>
                                  </div>
                                  {(item.size || item.color) && (
                                    <div className="order-item-variants">
                                      {item.size && <span className="variant-badge">Size: {item.size}</span>}
                                      {item.color && <span className="variant-badge">Color: {item.color}</span>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="no-items">No items found</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;

