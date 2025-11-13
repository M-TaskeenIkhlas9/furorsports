import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import './Products.css'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')
  const search = searchParams.get('search')

  useEffect(() => {
    fetchProducts()
  }, [category, subcategory, search])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let url = '/api/products'
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (subcategory) params.append('subcategory', subcategory)
      if (search) params.append('search', search)
      if (params.toString()) url += '?' + params.toString()

      const response = await fetch(url)
      const data = await response.json()
      setProducts(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setLoading(false)
    }
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="page-header">
          <h1 className="products-page-title">OUR PRODUCTS</h1>
          {category && <p className="category-filter">Category: {category}</p>}
          {subcategory && <p className="subcategory-filter">Subcategory: {subcategory}</p>}
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>No products found.</p>
            <Link to="/products" className="btn btn-primary">View All Products</Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`}>
                  <div className="product-image">
                    <img 
                      src={product.image || '/placeholder-product.jpg'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=Product'
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    <button className="btn btn-primary">View Details</button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products

