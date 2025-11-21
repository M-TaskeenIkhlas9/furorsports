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
    // Show ALL orders by default, only filter if URL has specific filter
    const statusFilter = searchParams.get('status');
    const customFilter = searchParams.get('filter');
    
    if (customFilter === 'non-delivered') {
      const filtered = orders.filter(order => {
        const status = order.status?.toLowerCase();
        return (status === 'processing' || status === 'shipped') 
          && status !== 'cancelled' 
          && status !== 'canceled';
      });
      setFilteredOrders(filtered);
    } else if (statusFilter) {
      const filtered = orders.filter(order => 
        order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
      setFilteredOrders(filtered);
    } else {
      // No filter - show ALL orders
      setFilteredOrders(orders);
    }
  }, [orders, searchParams]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      setOrders(data);
      // Show all orders by default - filtering will be handled in useEffect
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

  const deleteOrder = async (id, orderNumber) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete order ${orderNumber}?\n\n` +
      `This action cannot be undone. The order and all its items will be permanently deleted.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        // Clear selected order if it was deleted
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(null);
        }
        // Refresh orders list
        await fetchOrders();
        alert('Order deleted successfully!');
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const canDeleteOrder = (status) => {
    const statusLower = status?.toLowerCase();
    return statusLower === 'pending' || statusLower === 'delivered' || statusLower === 'cancelled' || statusLower === 'canceled';
  };

  const exportOrdersToCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export');
      return;
    }

    // CSV Headers
    const headers = ['Order Number', 'Customer Name', 'Email', 'Phone', 'Date', 'Amount', 'Status', 'Payment Status', 'Address', 'City', 'Country'];
    
    // CSV Rows
    const rows = filteredOrders.map(order => [
      order.order_number || '',
      order.customer_name || '',
      order.email || '',
      order.phone || '',
      new Date(order.created_at).toLocaleString(),
      `$${order.total_amount?.toFixed(2) || '0.00'}`,
      order.status || '',
      order.payment_status || '',
      order.address || '',
      order.city || '',
      order.country || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const exportShippingLabel = () => {
    if (!selectedOrder) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Format the shipping label content with images
    const itemsList = selectedOrder.items?.map((item, index) => {
      // Handle both relative and absolute image URLs
      let imageUrl = item.image || 'https://via.placeholder.com/80?text=No+Image';
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        // If it's a relative path, make it absolute
        imageUrl = window.location.origin + imageUrl;
      }
      
      return `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding: 6px; border: 1px solid #ddd; border-radius: 4px; page-break-inside: avoid;">
          <img 
            src="${imageUrl}" 
            alt="${item.name}"
            style="width: 40px; height: 40px; object-fit: cover; border-radius: 3px; border: 1px solid #ccc; flex-shrink: 0;"
            onerror="this.onerror=null; this.src='https://via.placeholder.com/40?text=No+Image'"
          />
          <div style="flex: 1;">
            <div style="font-weight: bold; margin-bottom: 2px; font-size: 13px;">${index + 1}. ${item.name}</div>
            <div style="font-size: 11px; color: #666;">
              Qty: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}
            </div>
          </div>
        </div>
      `;
    }).join('') || '<p>No items</p>';

    const shippingLabelHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Label - ${selectedOrder.order_number}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0.5cm;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 15px;
              max-width: 700px;
              margin: 0 auto;
              background: white;
              color: #000;
            }
            .shipping-label {
              border: 2px solid #000;
              padding: 15px;
              margin-bottom: 15px;
              page-break-inside: avoid;
            }
            .label-header {
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .label-header h1 {
              margin: 0;
              font-size: 20px;
              font-weight: bold;
            }
            .label-section {
              margin-bottom: 12px;
            }
            .label-section h3 {
              margin: 0 0 6px 0;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              border-bottom: 1px solid #ccc;
              padding-bottom: 4px;
            }
            .label-section p {
              margin: 3px 0;
              font-size: 13px;
              line-height: 1.5;
            }
            .shipping-address {
              font-size: 14px;
              font-weight: bold;
              line-height: 1.6;
            }
            .order-items {
              font-size: 13px;
              line-height: 1.6;
            }
            .order-item-with-image {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 12px;
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 5px;
              page-break-inside: avoid;
            }
            .order-item-image {
              width: 60px;
              height: 60px;
              object-fit: cover;
              border-radius: 4px;
              border: 1px solid #ccc;
              flex-shrink: 0;
            }
            .order-item-details {
              flex: 1;
            }
            @media print {
              .order-item-with-image {
                border: 1px solid #000;
              }
              .order-item-image {
                border: 1px solid #000;
              }
            }
            .order-info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-top: 12px;
            }
            .info-box {
              border: 1px solid #ccc;
              padding: 8px;
              background: #f9f9f9;
            }
            .info-box strong {
              display: block;
              margin-bottom: 4px;
              font-size: 11px;
              text-transform: uppercase;
            }
            .barcode-area {
              text-align: center;
              margin-top: 15px;
              padding: 10px;
              border: 1px dashed #000;
              font-family: 'Courier New', monospace;
              font-size: 16px;
              font-weight: bold;
              letter-spacing: 2px;
            }
            @media print {
              .no-print {
                display: none;
              }
              .shipping-label {
                border: 2px solid #000;
              }
            }
            .print-button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 10px 20px;
              font-size: 16px;
              cursor: pointer;
              border-radius: 5px;
              margin: 10px;
            }
            .print-button:hover {
              background: #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <button class="print-button" onclick="window.print()">🖨️ Print Shipping Label</button>
          </div>
          
          <div class="shipping-label">
            <div class="label-header">
              <h1>SHIPPING LABEL</h1>
            </div>
            
            <div class="label-section">
              <h3>Ship To:</h3>
              <div class="shipping-address">
                <p><strong>${selectedOrder.customer_name}</strong></p>
                <p>${selectedOrder.address}</p>
                <p>${selectedOrder.city}, ${selectedOrder.country}</p>
                <p>Phone: ${selectedOrder.phone || 'N/A'}</p>
                <p>Email: ${selectedOrder.email}</p>
              </div>
            </div>
            
            <div class="order-info-grid">
              <div class="info-box">
                <strong>Order Number</strong>
                <div style="font-size: 18px; font-weight: bold; margin-top: 5px;">${selectedOrder.order_number}</div>
              </div>
              <div class="info-box">
                <strong>Order Date</strong>
                <div style="margin-top: 5px;">${new Date(selectedOrder.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
              </div>
              <div class="info-box">
                <strong>Total Amount</strong>
                <div style="font-size: 16px; font-weight: bold; margin-top: 5px;">$${selectedOrder.total_amount.toFixed(2)}</div>
              </div>
              <div class="info-box">
                <strong>Payment Status</strong>
                <div style="margin-top: 5px; text-transform: uppercase;">${selectedOrder.payment_status || 'N/A'}</div>
              </div>
            </div>
            
            <div class="label-section">
              <h3>Order Items:</h3>
              <div class="order-items">
                ${itemsList}
              </div>
            </div>
            
            <div class="label-section">
              <h3>Total Items:</h3>
              <p style="font-size: 16px; font-weight: bold;">
                ${selectedOrder.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} item(s)
              </p>
            </div>
            
            <div class="barcode-area">
              ORDER: ${selectedOrder.order_number}
            </div>
          </div>
          
          <script>
            // Auto-print when window loads (optional - commented out)
            // window.onload = function() {
            //   window.print();
            // }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(shippingLabelHTML);
    printWindow.document.close();
    
    // Wait for content to load, then focus for printing
    setTimeout(() => {
      printWindow.focus();
    }, 250);
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
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={exportOrdersToCSV}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                title="Export orders to CSV"
              >
                📥 Export CSV
              </button>
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
              <div className="orders-header">
                <h2>
                  {searchParams.get('filter') === 'non-delivered'
                    ? `Non-Delivered Orders (${filteredOrders.length})`
                    : searchParams.get('status') 
                      ? `${searchParams.get('status').charAt(0).toUpperCase() + searchParams.get('status').slice(1)} Orders (${filteredOrders.length})`
                      : `All Orders (${filteredOrders.length})`
                  }
                </h2>
              </div>

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
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fetchOrderDetails(order.id);
                                }}
                                className="btn-view"
                              >
                                View
                              </button>
                              {canDeleteOrder(order.status) && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteOrder(order.id, order.order_number);
                                  }}
                                  className="btn-delete"
                                  title="Delete Order"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
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
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                      onClick={exportShippingLabel}
                      className="btn-export"
                      title="Export/Print Shipping Label"
                    >
                      📦 Print
                    </button>
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="btn-close"
                    >
                      ×
                    </button>
                  </div>
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
                          {(item.size || item.color) && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                              {item.size && <span style={{ fontSize: '0.85rem', color: '#93c5fd' }}>Size: {item.size}</span>}
                              {item.color && <span style={{ fontSize: '0.85rem', color: '#93c5fd' }}>Color: {item.color}</span>}
                            </div>
                          )}
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
                  
                  {canDeleteOrder(selectedOrder.status) && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #374151' }}>
                      <h3 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>Danger Zone</h3>
                      <button 
                        onClick={() => deleteOrder(selectedOrder.id, selectedOrder.order_number)}
                        className="btn-delete-large"
                      >
                        🗑️ Delete Order
                      </button>
                      <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                        This will permanently delete this order and all its items. This action cannot be undone.
                      </p>
                    </div>
                  )}
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

