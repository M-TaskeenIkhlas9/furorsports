import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { generateWhatsAppUrl } from '../config/api'
import './CheckoutSuccess.css'

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [orderInfo, setOrderInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const sessionId = searchParams.get('session_id')
  const orderNumber = searchParams.get('order')

  useEffect(() => {
    if (sessionId) {
      // Stripe payment flow
      verifyPayment()
    } else if (orderNumber) {
      // WhatsApp order flow
      fetchOrder()
    } else {
      // Check localStorage for pending order
      const pendingOrder = localStorage.getItem('pendingOrder')
      if (pendingOrder) {
        try {
          const order = JSON.parse(pendingOrder)
          setOrderInfo({
            orderNumber: order.orderNumber,
            orderId: order.orderId,
            paymentStatus: 'pending',
            isWhatsAppOrder: true
          })
        } catch (error) {
          console.error('Error parsing pending order:', error)
        }
      }
      setLoading(false)
    }
  }, [sessionId, orderNumber])

  const verifyPayment = async () => {
    try {
      const response = await fetch('/api/payment/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        const data = await response.json()
        setOrderInfo(data)
      } else {
        console.error('Payment verification failed')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`)
      if (response.ok) {
        const data = await response.json()
        setOrderInfo({
          orderNumber: data.order_number,
          orderId: data.id,
          paymentStatus: data.payment_status || 'pending',
          status: data.status,
          isWhatsAppOrder: true
        })
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenWhatsApp = () => {
    const message = `Hello! I just placed an order ${orderInfo?.orderNumber || orderNumber}. Please confirm and provide payment instructions.`
    const whatsappUrl = generateWhatsAppUrl(message)
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="checkout-success-page">
        <div className="success-modal-overlay">
          <div className="loading">
            <div className="spinner"></div>
            <p>Verifying your payment...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-success-page">
      <div className="success-modal-overlay">
        {orderInfo ? (
          <div className="success-modal">
            <div className="success-icon-container">
              <div className={`success-icon ${orderInfo.isWhatsAppOrder ? 'whatsapp-icon' : ''}`}>
                {orderInfo.isWhatsAppOrder ? '📱' : '✓'}
              </div>
            </div>
            
            <h1 className="success-title">
              {orderInfo.isWhatsAppOrder ? 'Order Created Successfully!' : 'Payment Successful!'}
            </h1>
            
            <div className="success-confirmation-box">
              <p className="success-confirmation-text">
                {orderInfo.isWhatsAppOrder ? (
                  <>
                    Your order has been created. Please send the WhatsApp message to complete your order.
                    We'll confirm and provide payment instructions via WhatsApp.
                  </>
                ) : (
                  'Thank you for your purchase. Your order has been confirmed.'
                )}
              </p>
            </div>
            
            <div className="order-details-card">
              <h2 className="order-details-title">Order Details</h2>
              <div className="order-info-grid">
                <div className="order-info-item">
                  <span className="order-info-label">Order Number:</span>
                  <span className="order-info-value">{orderInfo.orderNumber || 'N/A'}</span>
                </div>
                <div className="order-info-divider"></div>
                <div className="order-info-item">
                  <span className="order-info-label">Status:</span>
                  <span className={`order-info-value ${orderInfo.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}`}>
                    {orderInfo.isWhatsAppOrder ? 'Pending Confirmation' : (orderInfo.paymentStatus === 'paid' ? 'Paid' : orderInfo.paymentStatus || 'Pending')}
                  </span>
                </div>
              </div>
            </div>

            {orderInfo.isWhatsAppOrder && (
              <div className="whatsapp-instructions">
                <p><strong>Next Steps:</strong></p>
                <ol>
                  <li>Check your browser - a WhatsApp window should have opened</li>
                  <li>Send the pre-filled message to complete your order</li>
                  <li>We'll confirm your order and provide payment instructions</li>
                </ol>
                <button 
                  onClick={handleOpenWhatsApp}
                  className="btn-whatsapp"
                >
                  📱 Open WhatsApp Again
                </button>
              </div>
            )}

            <div className="success-actions">
              <Link to="/" className="btn-success-primary">
                CONTINUE SHOPPING
              </Link>
              <Link to="/products" className="btn-success-secondary">
                VIEW PRODUCTS
              </Link>
            </div>
          </div>
        ) : (
          <div className="success-modal">
            <div className="success-icon-container">
              <div className="success-icon">⏳</div>
            </div>
            <h1 className="success-title">Processing Order</h1>
            <p className="success-confirmation-text">
              Your order is being processed. You will receive a confirmation shortly.
            </p>
            <Link to="/" className="btn-success-primary">
              RETURN TO HOME
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutSuccess

