import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=8')
      const data = await response.json()
      setProducts(data.slice(0, 8))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setLoading(false)
    }
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Toledo Exporters</h1>
          <p>Professional Sports Wear, Fitness Wear & Street Wear</p>
          <Link to="/products" className="btn btn-primary">VIEW PRODUCTS</Link>
        </div>
        <div className="hero-slider">
          <div className="slide active">
            <h2>Quality Sports Wear</h2>
            <Link to="/products?category=Sports Uniforms" className="btn btn-outline">VIEW PRODUCTS</Link>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="section about-section">
        <div className="container">
          <h2 className="section-title">Who We Are.</h2>
          <div className="about-content">
            <p>
              TOLEDO EXPORTERS is a Family Owned company from Sialkot in Pakistan, 
              that has been manufacturing high quality Professional Sports Wears, 
              Fitness Wears, Casual Wear and all kinds of Street Wears equipment. 
              Our products are shipped and delivered all around the World to countless 
              satisfied Athletes that use our gear. Our specialty is the ability to 
              manufacture and ship our huge range of products at such lucrative prices, 
              as well as ensuring our customer's satisfaction 100% at all times. 
              Our product speaks for themselves and our consistency in delivery and 
              quality is unmatched.
            </p>
            <p>
              We look forward to providing with you with the best quality gear that 
              gets you the Gold!!
            </p>
            <Link to="/about" className="btn btn-primary">LEARN MORE</Link>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section values-section">
        <div className="container">
          <h2 className="section-title">OUR CORE VALUES.</h2>
          <p className="values-intro">
            Our vision was to create more than just a place where people could buy 
            affordable active wear or sportswear in Pakistan. We wanted our customers 
            to be able to be true to their style, while maintaining tactile functionality. 
            We have tried to maximize comfort by designing our own unique measurement and fittings.
          </p>
          <div className="values-grid">
            <div className="value-card">
              <h3>Fitness Wears</h3>
              <p>High-quality fitness wear for all your training needs</p>
            </div>
            <div className="value-card">
              <h3>Sports Uniforms</h3>
              <p>Professional sports uniforms for teams and athletes</p>
            </div>
            <div className="value-card">
              <h3>Street Wears</h3>
              <p>Stylish and comfortable street wear for everyday</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="section products-section">
        <div className="container">
          <h2 className="section-title">LATEST PRODUCTS.</h2>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
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
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    <Link to={`/product/${product.id}`} className="btn btn-outline">
                      Show Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center" style={{ marginTop: '2rem' }}>
            <Link to="/products" className="btn btn-primary">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section why-choose-section">
        <div className="container">
          <h2 className="section-title">WHY CHOOSE US?</h2>
          <p className="why-choose-intro">
            We are devoting all our passion and interests in presenting you the best 
            quality custom Sportswear globally at your desired Prices.
          </p>
          <div className="features-grid">
            <div className="feature">
              <h3>MINIMUM QUANTITY</h3>
              <p>Flexible minimum order quantities</p>
            </div>
            <div className="feature">
              <h3>LOW PRICING</h3>
              <p>Competitive prices without compromising quality</p>
            </div>
            <div className="feature">
              <h3>OUR EXPERIENCE</h3>
              <p>Years of expertise in manufacturing</p>
            </div>
            <div className="feature">
              <h3>HIGH QUALITY</h3>
              <p>Premium materials and craftsmanship</p>
            </div>
            <div className="feature">
              <h3>SAMPLE & PROTOTYPES</h3>
              <p>Available samples before bulk orders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section newsletter-section">
        <div className="container">
          <h2 className="section-title">Subscribe to our Newsletter.</h2>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="text" 
              placeholder="Name *" 
              required
              name="name"
            />
            <input 
              type="email" 
              placeholder="E-Mail *" 
              required
              name="email"
            />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  )

  async function handleNewsletterSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name'),
      email: formData.get('email')
    }

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      alert(result.message || 'Successfully subscribed!')
      e.target.reset()
    } catch (error) {
      alert('Error subscribing. Please try again.')
    }
  }
}

export default Home

