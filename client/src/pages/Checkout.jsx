import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { generateWhatsAppUrl } from '../config/api'
import './Checkout.css'

const Checkout = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderProcessing, setOrderProcessing] = useState(false) // Prevent duplicate submissions
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    let sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
      navigate('/cart')
      return
    }

    try {
      const response = await fetch(`/api/cart/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.length === 0) {
          navigate('/cart')
          return
        }
        setCartItems(data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching cart:', error)
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const formatWhatsAppMessage = (orderData) => {
    const { order } = orderData
    const items = order.items || []
    
    // Get base URL for images
    const getImageUrl = (imagePath) => {
      if (!imagePath) return null
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }
      // For relative paths, use current origin
      return window.location.origin + imagePath
    }
    
    let message = `🛍️ *NEW ORDER REQUEST*\n\n`
    message += `*Order Number:* ${order.order_number}\n\n`
    message += `*Customer Details:*\n`
    message += `Name: ${order.customer_name}\n`
    message += `Email: ${order.email}\n`
    if (order.phone) {
      message += `Phone: ${order.phone}\n`
    }
    message += `\n*Shipping Address:*\n`
    message += `${order.address}\n`
    message += `${order.city}, ${order.country}\n\n`
    message += `*Order Items:*\n\n`
    
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`
      message += `   Qty: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}\n`
      if (item.size) {
        message += `   Size: ${item.size}\n`
      }
      if (item.color) {
        message += `   Color: ${item.color}\n`
      }
      // Add product image URL if available
      if (item.image) {
        const imageUrl = getImageUrl(item.image)
        if (imageUrl) {
          message += `   📷 Image: ${imageUrl}\n`
        }
      }
      message += `\n`
    })
    
    message += `*Total Amount: $${order.total_amount.toFixed(2)}*\n\n`
    message += `Please confirm this order and provide payment instructions.`
    
    return message
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent duplicate submissions
    if (submitting || orderProcessing) {
      console.log('Order already being processed, ignoring duplicate submission')
      return
    }
    
    setSubmitting(true)
    setOrderProcessing(true)

    const sessionId = localStorage.getItem('sessionId')
    
    // Validate cart is not empty
    if (!cartItems || cartItems.length === 0) {
      alert('Your cart is empty. Please add items before checkout.')
      setSubmitting(false)
      setOrderProcessing(false)
      return
    }
    
    const items = cartItems.map(item => ({
      product_id: item.product_id,
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      price: item.price,
      size: item.size || null,
      color: item.color || null
    }))

    try {
      // Create WhatsApp order (pending status)
      const response = await fetch('/api/orders/create-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          customerInfo: formData,
          items
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Validate response structure
        if (!result.orderNumber || !result.order) {
          console.error('Invalid response structure:', result)
          alert('Error: Invalid order response. Please try again.')
          setSubmitting(false)
          setOrderProcessing(false)
          return
        }
        
        // Clear cart immediately to prevent duplicate orders
        try {
          await fetch(`/api/cart/${sessionId}`, { method: 'DELETE' }).catch(() => {})
          localStorage.removeItem('sessionId')
        } catch (cartError) {
          console.error('Error clearing cart:', cartError)
        }
        
        // Generate WhatsApp message
        try {
          const whatsappMessage = formatWhatsAppMessage(result)
          const whatsappUrl = generateWhatsAppUrl(whatsappMessage)
          
          // Store order info for success page
          localStorage.setItem('pendingOrder', JSON.stringify({
            orderNumber: result.orderNumber,
            orderId: result.orderId
          }))
          
          // Mark order as completed to prevent navigation issues
          setOrderProcessing(false)
          
          // Open WhatsApp in new tab
          window.open(whatsappUrl, '_blank')
          
          // Navigate to success page
          navigate(`/checkout/success?order=${result.orderNumber}`)
        } catch (formatError) {
          console.error('Error formatting WhatsApp message:', formatError)
          // Still navigate to success page even if WhatsApp formatting fails
          localStorage.setItem('pendingOrder', JSON.stringify({
            orderNumber: result.orderNumber,
            orderId: result.orderId
          }))
          setOrderProcessing(false)
          navigate(`/checkout/success?order=${result.orderNumber}`)
        }
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          errorData = { error: `Server error (${response.status}): ${response.statusText}` }
        }
        console.error('Order creation error:', errorData)
        alert(errorData.error || 'Error creating order. Please try again.')
        setSubmitting(false)
        setOrderProcessing(false)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      alert(`Error processing order: ${error.message || 'Please try again.'}`)
      setSubmitting(false)
      setOrderProcessing(false)
    }
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="checkout-form-section">
            <h2>Shipping Information</h2>
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-large"
                disabled={submitting || orderProcessing}
              >
                {submitting || orderProcessing ? 'Creating Order...' : '📱 Order via WhatsApp'}
              </button>
              
              <div className="checkout-info-box">
                <p>💡 <strong>How it works:</strong></p>
                <p>After submitting, your order will be created and a WhatsApp message will open. Send the message to complete your order. We'll confirm and provide payment instructions via WhatsApp.</p>
              </div>
            </form>
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cartItems.map(item => (
                <div key={item.id} className="order-item">
                  <div className="order-item-info">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <p className="order-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="order-total">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

