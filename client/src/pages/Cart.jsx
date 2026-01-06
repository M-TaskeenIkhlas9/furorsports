import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { API_URL, getImageUrl } from '../config/api'
import './Cart.css'

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    let sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = uuidv4()
      localStorage.setItem('sessionId', sessionId)
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        // Ensure data is an array
        setCartItems(Array.isArray(data) ? data : [])
      } else {
        setCartItems([])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCartItems([])
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId, newQuantity) => {
    const sessionId = localStorage.getItem('sessionId')
    
    try {
      const response = await fetch(`${API_URL}/api/cart/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          cartItemId,
          quantity: newQuantity
        })
      })

      if (response.ok) {
        fetchCart()
      }
    } catch (error) {
      alert('Error updating cart. Please try again.')
    }
  }

  const removeItem = async (cartItemId) => {
    const sessionId = localStorage.getItem('sessionId')
    
    try {
      const response = await fetch(`${API_URL}/api/cart/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          cartItemId
        })
      })

      if (response.ok) {
        fetchCart()
      }
    } catch (error) {
      alert('Error removing item. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>
            <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <Link to={`/product/${item.product_id}`} className="cart-item-image">
                    <img 
                      src={getImageUrl(item.image) || '/placeholder-product.jpg'} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150x150?text=Product'
                      }}
                    />
                  </Link>
                  
                  <div className="cart-item-info">
                    <Link to={`/product/${item.product_id}`}>
                      <h3>{item.name}</h3>
                    </Link>
                    {(item.size || item.color) && (
                      <div className="cart-item-variants">
                        {item.size && <span className="variant-badge">Size: {item.size}</span>}
                        {item.color && <span className="variant-badge">Color: {item.color}</span>}
                      </div>
                    )}
                  </div>

                  <div className="cart-item-quantity">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>

                  <button 
                    className="remove-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Prices will be provided when you place your order via WhatsApp.
              </p>
              <button 
                className="btn btn-primary btn-large"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
              <Link to="/products" className="btn btn-outline btn-large">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart

