import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import './CheckoutSuccess.css'

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [orderInfo, setOrderInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      verifyPayment()
    } else {
      setLoading(false)
    }
  }, [sessionId])

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
              <div className="success-icon">✓</div>
            </div>
            
            <h1 className="success-title">Payment Successful!</h1>
            
            <div className="success-confirmation-box">
              <p className="success-confirmation-text">
                Thank you for your purchase. Your order has been confirmed.
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
                  <span className="order-info-label">Payment Status:</span>
                  <span className="order-info-value status-paid">{orderInfo.paymentStatus === 'paid' ? 'paid' : orderInfo.paymentStatus || 'pending'}</span>
                </div>
              </div>
            </div>

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
            <h1 className="success-title">Payment Processing</h1>
            <p className="success-confirmation-text">
              Your payment is being processed. You will receive a confirmation email shortly.
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

