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
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchProduct()
    setCurrentImageIndex(0)
    setSelectedSize('')
    setSelectedColor('')
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        // Reset to first image when product changes
        setCurrentImageIndex(0)
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
          quantity,
          size: selectedSize || null,
          color: selectedColor || null
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

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
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
            {product.images && product.images.length > 0 ? (
              <div className="image-carousel">
                {product.sale_price && product.sale_price < product.price && (
                  <div className="product-sale-badge-overlay-detail">SALE</div>
                )}
                <img 
                  src={product.images[currentImageIndex] || '/placeholder-product.jpg'} 
                  alt={product.name}
                  className="main-product-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500x500?text=Product'
                  }}
                />
                {product.images.length > 1 && (
                  <>
                    <button 
                      className="carousel-arrow carousel-arrow-left"
                      onClick={prevImage}
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button 
                      className="carousel-arrow carousel-arrow-right"
                      onClick={nextImage}
                      aria-label="Next image"
                    >
                      ›
                    </button>
                    <div className="image-indicators">
                      {product.images.map((_, index) => (
                        <span
                          key={index}
                          className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                {product.sale_price && product.sale_price < product.price && (
                  <div className="product-sale-badge-overlay-detail">SALE</div>
                )}
                <img 
                  src={product.image || '/placeholder-product.jpg'} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500x500?text=Product'
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="product-info-section">
            <h1>{product.name}</h1>
            <p className="product-category">{product.category} {product.subcategory && `> ${product.subcategory}`}</p>
            <div className="product-price-container">
              {product.sale_price && product.sale_price < product.price ? (
                <>
                  <span className="product-price-sale">{product.sale_price.toFixed(2)}</span>
                  <span className="product-price-original">{product.price.toFixed(2)}</span>
                  <span className="sale-badge">SALE</span>
                </>
              ) : (
                <span className="product-price">{product.price.toFixed(2)}</span>
              )}
            </div>
            
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description || 'No description available.'}</p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="product-option">
                <label>Size:</label>
                <div className="option-buttons">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`option-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="product-option">
                <label>Color:</label>
                <div className="option-buttons">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`option-btn color-btn ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

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

