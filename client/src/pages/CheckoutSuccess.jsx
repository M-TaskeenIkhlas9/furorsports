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
        <div className="container">
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
      <div className="container">
        {orderInfo ? (
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h1>Payment Successful!</h1>
            <p className="success-message">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            
            <div className="order-details">
              <h2>Order Details</h2>
              <div className="detail-row">
                <span>Order Number:</span>
                <strong>{orderInfo.orderNumber}</strong>
              </div>
              <div className="detail-row">
                <span>Payment Status:</span>
                <strong className="status-paid">{orderInfo.paymentStatus}</strong>
              </div>
            </div>

            <div className="success-actions">
              <Link to="/" className="btn btn-primary">
                Continue Shopping
              </Link>
              <Link to="/products" className="btn btn-outline">
                View Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="success-content">
            <h1>Payment Processing</h1>
            <p>Your payment is being processed. You will receive a confirmation email shortly.</p>
            <Link to="/" className="btn btn-primary">
              Return to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutSuccess

