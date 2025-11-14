import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminAuthenticated')) {
      navigate('/admin/login');
      return;
    }
    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    const statusFilter = searchParams.get('status');
    const customFilter = searchParams.get('filter');
    
    if (customFilter === 'non-delivered') {
      // Show orders that are NOT delivered (processing and shipped), excluding cancelled
      const filtered = orders.filter(order => {
        const status = order.status?.toLowerCase();
        return (status === 'processing' || status === 'shipped') 
          && status !== 'cancelled' 
          && status !== 'canceled';
      });
      setFilteredOrders(filtered);
    } else if (statusFilter) {
      // Filter by exact status match
      const filtered = orders.filter(order => 
        order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [orders, searchParams]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (id) => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`);
      const data = await response.json();
      setSelectedOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          fetchOrderDetails(id);
        }
        alert('Order status updated successfully!');
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'processing':
        return '#3b82f6';
      case 'shipped':
        return '#8b5cf6';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div>
              <h1>Order Management</h1>
              <p className="admin-subtitle">View and manage customer orders</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {(searchParams.get('status') || searchParams.get('filter')) && (
                <button 
                  onClick={() => navigate('/admin/orders')} 
                  className="btn btn-secondary"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  Show All Orders
                </button>
              )}
              <button 
                onClick={() => navigate('/admin/dashboard')} 
                className="btn btn-outline"
              >
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          <div className="orders-layout">
            <div className="orders-list">
              <h2>
                {searchParams.get('filter') === 'non-delivered'
                  ? `Non-Delivered Orders (${filteredOrders.length})`
                  : searchParams.get('status') 
                    ? `${searchParams.get('status').charAt(0).toUpperCase() + searchParams.get('status').slice(1)} Orders (${filteredOrders.length})`
                    : `All Orders (${filteredOrders.length})`
                }
              </h2>
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="no-orders">No orders found</td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr 
                          key={order.id}
                          className={selectedOrder?.id === order.id ? 'selected' : ''}
                          onClick={() => fetchOrderDetails(order.id)}
                        >
                          <td>{order.order_number}</td>
                          <td>{order.customer_name}</td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td>${order.total_amount.toFixed(2)}</td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(order.status) }}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <span 
                              className={`payment-status ${order.payment_status}`}
                            >
                              {order.payment_status}
                            </span>
                          </td>
                          <td>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchOrderDetails(order.id);
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

            {selectedOrder && (
              <div className="order-details">
                <div className="order-details-header">
                  <h2>Order Details</h2>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="btn-close"
                  >
                    ×
                  </button>
                </div>

                <div className="order-info-section">
                  <h3>Order Information</h3>
                  <div className="info-grid">
                    <div className="info-item full-width">
                      <label>Order Number</label>
                      <span className="order-number">{selectedOrder.order_number}</span>
                    </div>
                    <div className="info-item">
                      <label>Date</label>
                      <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                    <div className="info-item">
                      <label>Status</label>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="info-item full-width highlight-card">
                      <label>Total Amount</label>
                      <span className="amount">${selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Payment Status</label>
                      <span className={`payment-status ${selectedOrder.payment_status}`}>
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-info-section">
                  <h3>Customer Information</h3>
                  <div className="info-grid">
                    <div className="info-item full-width">
                      <label>Name</label>
                      <span className="customer-name">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Email</label>
                      <span className="customer-email">{selectedOrder.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <span>{selectedOrder.phone || 'N/A'}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Address</label>
                      <span className="customer-address">{selectedOrder.address}, {selectedOrder.city}, {selectedOrder.country}</span>
                    </div>
                  </div>
                </div>

                <div className="order-info-section">
                  <h3>Order Items</h3>
                  <div className="order-items-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="order-item-card">
                        <img 
                          src={item.image || 'https://via.placeholder.com/60'} 
                          alt={item.name}
                          className="item-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                          }}
                        />
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p>Quantity: {item.quantity} × ${item.price.toFixed(2)}</p>
                        </div>
                        <div className="item-total">
                          ${(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-actions">
                  <h3>Update Status</h3>
                  <div className="status-buttons">
                    <button 
                      onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                      className="btn-status"
                      disabled={selectedOrder.status === 'processing'}
                    >
                      Processing
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                      className="btn-status"
                      disabled={selectedOrder.status === 'shipped'}
                    >
                      Shipped
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      className="btn-status"
                      disabled={selectedOrder.status === 'delivered'}
                    >
                      Delivered
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                      className="btn-status btn-cancel"
                      disabled={selectedOrder.status === 'cancelled'}
                    >
                      Cancel
                    </button>
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

export default AdminOrders;

