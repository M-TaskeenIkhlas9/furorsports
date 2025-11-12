import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import './ProductDetail.css'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else {
        navigate('/products')
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching product:', error)
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    let sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = uuidv4()
      localStorage.setItem('sessionId', sessionId)
    }

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          productId: parseInt(id),
          quantity
        })
      })

      if (response.ok) {
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 3000)
      }
    } catch (error) {
      alert('Error adding to cart. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail">
          <div className="product-image-section">
            <img 
              src={product.image || '/placeholder-product.jpg'} 
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x500?text=Product'
              }}
            />
          </div>
          
          <div className="product-info-section">
            <h1>{product.name}</h1>
            <p className="product-category">{product.category} {product.subcategory && `> ${product.subcategory}`}</p>
            <p className="product-price">${product.price.toFixed(2)}</p>
            
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description || 'No description available.'}</p>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-large"
                onClick={handleAddToCart}
              >
                {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
              </button>

              <button 
                className="btn btn-outline btn-large"
                onClick={() => navigate('/cart')}
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

