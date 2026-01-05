import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { getOrganizationSchema, getWebsiteSchema } from '../utils/structuredData'
import { API_URL } from '../config/api'
import './Home.css'

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [productIndex, setProductIndex] = useState(0)
  const [heroSlides, setHeroSlides] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchFeaturedProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Fetch the 8 newest products (backend handles limit and sorting)
      const response = await fetch(`${API_URL}/api/products?limit=8`)
      const data = await response.json()
      setProducts(data) // Backend already returns only 8 newest products
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setLoading(false)
    }
  }

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/featured/hero`)
      const data = await response.json()
      
      // Transform products into slide format
      const transformedSlides = data.map(product => {
        // Better category parsing for title/subtitle
        let title = 'PRODUCT'
        let subtitle = 'COLLECTION'
        let subtitle2 = ''
        
        if (product.category) {
          const categoryUpper = product.category.toUpperCase()
          
          // Handle specific categories
          if (categoryUpper.includes('STREET')) {
            subtitle = 'CASUAL'
            title = 'STREET'
            subtitle2 = 'WEAR'
          } else if (categoryUpper.includes('FITNESS')) {
            subtitle = 'PREMIUM'
            title = 'FITNESS'
            subtitle2 = 'ACTIVEWEAR'
          } else if (categoryUpper.includes('SPORTS')) {
            subtitle = 'ATHLETIC'
            title = 'SPORTS'
            subtitle2 = 'UNIFORMS'
          } else if (categoryUpper.includes('MARTIAL') || categoryUpper.includes('KARATE')) {
            subtitle = 'TRADITIONAL'
            title = 'MARTIAL ARTS'
            subtitle2 = 'UNIFORMS'
          } else {
            // Generic parsing
            const words = product.category.split(' ')
            if (words.length >= 2) {
              subtitle = words[0]?.toUpperCase() || 'COLLECTION'
              title = words.slice(1, 2).join(' ').toUpperCase() || 'PRODUCT'
              subtitle2 = words.slice(2).join(' ').toUpperCase() || ''
            } else {
              title = words[0]?.toUpperCase() || 'PRODUCT'
            }
          }
        }
        
        // Extract features from description - improved pattern matching
        let features = []
        if (product.description) {
          const desc = product.description.toLowerCase()
          
          // Define feature templates based on keywords found
          const featureTemplates = {
            'soft': ['Soft & Breathable', 'Soft & Comfortable', 'Soft Material'],
            'breathable': ['Breathable Fabric', 'Breathable & Lightweight', 'Breathable Material'],
            'cotton': ['Soft & Breathable Cotton Blend', 'Premium Cotton', 'Cotton Blend'],
            'racerback': ['Classic Racerback Design', 'Racerback Style', 'Racerback Design'],
            'moisture': ['Moisture-Wicking Properties', 'Moisture-Wicking Technology', 'Quick-Dry Technology'],
            'versatile': ['Versatile Day-to-Night Style', 'Versatile Design', 'Versatile & Comfortable'],
            'colors': ['Available in Multiple Colors', 'Multiple Color Options', 'Various Colors Available'],
            'compression': ['Premium Compression Fabric', 'Compression Fit', '4-Way Stretch'],
            'chlorine': ['Chlorine Resistant Fabric', 'Chlorine Resistant', 'Pool Resistant'],
            'supportive': ['Supportive & Comfortable Fit', 'Supportive Design', 'Comfortable Fit'],
            'stretch': ['4-Way Stretch for Freedom of Movement', 'Flexible Stretch', 'Freedom of Movement']
          }
          
          // Check for keywords and add corresponding features
          Object.keys(featureTemplates).forEach(keyword => {
            if (desc.includes(keyword) && features.length < 5) {
              const template = featureTemplates[keyword][0]
              if (!features.includes(template)) {
                features.push(template)
              }
            }
          })
          
          // If still not enough, try to extract from sentences
          if (features.length < 3) {
            const sentences = product.description.split(/[.!?]/).filter(s => s.trim().length > 15 && s.trim().length < 100)
            sentences.slice(0, 5 - features.length).forEach(s => {
              let feature = s.trim()
              // Capitalize first letter
              feature = feature.charAt(0).toUpperCase() + feature.slice(1)
              // Format: capitalize key words
              feature = feature.replace(/\b(cotton|fabric|design|style|fit|comfortable|breathable|soft|moisture|wicking|versatile|colors?|stretch|compression)\b/gi, (match) => {
                return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
              })
              if (!features.includes(feature) && !features.some(f => f.toLowerCase().includes(feature.toLowerCase().substring(0, 10)))) {
                features.push(feature)
              }
            })
          }
        }
        
        // Default features if none found - category-specific defaults
        if (features.length === 0) {
          if (product.category && product.category.toLowerCase().includes('street')) {
            features = [
              'Soft & Breathable Cotton Blend',
              'Classic Racerback Design',
              'Moisture-Wicking Properties',
              'Versatile Day-to-Night Style',
              'Available in Multiple Colors'
            ]
          } else if (product.category && product.category.toLowerCase().includes('fitness')) {
            features = [
              'Premium Compression Fabric',
              'Moisture-Wicking Technology',
              '4-Way Stretch for Freedom of Movement',
              'Breathable & Lightweight',
              'Perfect for Gym, Running & Training'
            ]
          } else if (product.category && product.category.toLowerCase().includes('sports')) {
            features = [
              'Chlorine Resistant Fabric',
              'Quick-Dry Technology',
              'Supportive & Comfortable Fit',
              'Stylish Color Block Design',
              'Ideal for Competitive Swimming'
            ]
          } else {
            features = [
              'Premium Quality Materials',
              'Comfortable & Durable',
              'Perfect Fit Guaranteed',
              'Stylish Design',
              'Great Value'
            ]
          }
        }
        
        // Format description - uppercase key parts
        let description = product.description || 'PREMIUM QUALITY PRODUCT DESIGNED FOR PERFORMANCE AND STYLE'
        // Make description uppercase for hero section
        description = description.toUpperCase()
        
        // Create CTA based on category
        const cta = product.category 
          ? `SHOP ${product.category.toUpperCase()}`
          : 'SHOP NOW'
        
        return {
          id: product.id,
          title,
          subtitle,
          subtitle2,
          description,
          image: product.image || '/images/placeholder.jpg',
          features: features.slice(0, 5), // Limit to 5 features
          cta,
          productId: product.id
        }
      })
      
      setHeroSlides(transformedSlides)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      // Fallback to default slides if API fails
      setHeroSlides([])
    }
  }

  // Fallback slides if no featured products
  const defaultSlides = [
    {
      title: 'FITNESS',
      subtitle: 'PREMIUM',
      subtitle2: 'ACTIVEWEAR',
      description: 'ELEVATE YOUR WORKOUT WITH OUR PREMIUM COMPRESSION ACTIVE WEAR - PERFECT FIT, MAXIMUM PERFORMANCE',
      image: '/images/products/furor-sport/fitness-activewear-set.jpg',
      features: [
        'Premium Compression Fabric',
        'Moisture-Wicking Technology',
        '4-Way Stretch for Freedom of Movement',
        'Breathable & Lightweight',
        'Perfect for Gym, Running & Training'
      ],
      cta: 'SHOP FITNESS WEAR'
    },
    {
      title: 'SWIMWEAR',
      subtitle: 'ATHLETIC',
      subtitle2: 'COLLECTION',
      description: 'STUNNING ATHLETIC SWIMWEAR THAT COMBINES STYLE WITH PERFORMANCE - PERFECT FOR POOL & BEACH',
      image: '/images/products/furor-sport/athletic-swimsuit.jpg',
      features: [
        'Chlorine Resistant Fabric',
        'Quick-Dry Technology',
        'Supportive & Comfortable Fit',
        'Stylish Color Block Design',
        'Ideal for Competitive Swimming'
      ],
      cta: 'SHOP SWIMWEAR'
    },
    {
      title: 'STREET',
      subtitle: 'CASUAL',
      subtitle2: 'WEAR',
      description: 'COMFORTABLE & STYLISH RACERBACK TANK TOPS - PERFECT FOR EVERYDAY WEAR & CASUAL WORKOUTS',
      image: '/images/products/furor-sport/racerback-tank.jpg',
      features: [
        'Soft & Breathable Cotton Blend',
        'Classic Racerback Design',
        'Moisture-Wicking Properties',
        'Versatile Day-to-Night Style',
        'Available in Multiple Colors'
      ],
      cta: 'SHOP STREET WEAR'
    }
  ]

  // Use featured products if available, otherwise use default slides
  const slides = heroSlides.length > 0 ? heroSlides : defaultSlides

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (slides.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebsiteSchema();

  return (
    <div className="home">
      <SEO
        title="Furor Sport - Professional Sports Wear & Fitness Apparel | Pakistan"
        description="Buy premium sports wear, fitness apparel, compression wear, and martial arts equipment from Furor Sport. Family-owned business from Sialkot, Pakistan. High-quality professional sports wear with worldwide shipping."
        keywords="sports wear, fitness apparel, compression wear, martial arts equipment, athletic wear, sports uniforms, fitness clothing, Pakistan sports wear, Sialkot sports wear, professional sports wear, gym wear, training apparel"
        url="/"
        structuredData={[organizationSchema, websiteSchema]}
      />
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background"></div>
        <div className="container hero-container">
          <div className="hero-content-wrapper">
            {/* Left Content */}
            <div className="hero-left">
              {slides.length > 0 && slides[currentSlide] ? (
                <>
                  <div className="hero-text-wrapper">
                    {slides[currentSlide].subtitle && (
                      <div className="hero-text-small">{slides[currentSlide].subtitle}</div>
                    )}
                    <div className="hero-text-large">{slides[currentSlide].title}</div>
                    {slides[currentSlide].subtitle2 && (
                      <div className="hero-text-small">{slides[currentSlide].subtitle2}</div>
                    )}
                    <div className="hero-orange-frame"></div>
                  </div>
                  <p className="hero-description">
                    {slides[currentSlide].description}
                  </p>
                  <div className="hero-features">
                    {slides[currentSlide].features?.map((feature, idx) => (
                      <div key={idx} className="hero-feature-item">
                        <span className="feature-check">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link 
                    to={slides[currentSlide]?.productId ? `/product/${slides[currentSlide].productId}` : "/products"} 
                    className="btn-hero-primary"
                  >
                    {slides[currentSlide]?.cta || 'VIEW PRODUCTS'}
                  </Link>
                </>
              ) : (
                <div style={{ color: '#ffffff', textAlign: 'center' }}>
                  <p>Loading featured products...</p>
                </div>
              )}
              <div className="hero-indicators">
                {slides.map((_, index) => (
                  <span
                    key={index}
                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  ></span>
                ))}
              </div>
            </div>

            {/* Right Image */}
            <div className="hero-right">
              {slides.length > 0 && slides[currentSlide] ? (
                <div className="hero-image-container">
                  <img 
                    src={slides[currentSlide].image} 
                    alt={slides[currentSlide].title}
                    className="hero-image"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=1000&fit=crop'
                    }}
                  />
                  <div className="hero-image-overlay">
                    <div className="hero-badge">NEW COLLECTION</div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Navigation Arrows */}
            <button className="hero-nav hero-nav-left" onClick={prevSlide}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button className="hero-nav hero-nav-right" onClick={nextSlide}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Create Your Own Brand Section */}
      <section className="create-brand-section">
        <div className="container">
          <h2 className="create-brand-title">CREATE YOUR OWN BRAND</h2>
          <div className="customization-steps">
            <div className="step-item">
              <span className="step-number">1</span>
              <span className="step-text">SELECT YOUR FABRIC</span>
            </div>
            <div className="step-item">
              <span className="step-number">2</span>
              <span className="step-text">SEND US YOUR SIZE AND STYLE</span>
            </div>
            <div className="step-item">
              <span className="step-number">3</span>
              <span className="step-text">ADD YOUR PRIVATE LABEL</span>
            </div>
            <div className="step-item">
              <span className="step-number">4</span>
              <span className="step-text">SEND US YOUR DESIGN</span>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="section about-section">
        <div className="about-background-image"></div>
        <div className="container">
          <h2 className="section-title about-title">
            WHO WE ARE<span className="title-dot"></span>
          </h2>
          <div className="about-content">
            <p>
              <span className="company-name">FUROR SPORT</span> is a Family Owned company from Sialkot in Pakistan, 
              that has been manufacturing high quality Professional Sports Wears, 
              Fitness Wears, Casual Wear and all kinds of Street Wears equipment. 
              Our products are shipped and delivered all around the World to countless 
              satisfied Athletes that use our gear. Our specialty is the ability to 
              manufacture and ship our huge range of products at such lucrative prices, 
              as well as ensuring our customer's satisfaction 100% at all times. 
              Our product speaks for themselves and our consistency in delivery and 
              quality is unmatched.
            </p>
            <p className="centered-text">
              We look forward to providing with you with the best quality gear that 
              gets you the Gold!!
            </p>
            <Link to="/about" className="btn btn-about-primary">LEARN MORE</Link>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section values-section">
        <div className="values-background-image"></div>
        <div className="container">
          <h2 className="section-title values-title">OUR CORE VALUES.</h2>
          <p className="values-intro">
            Our vision was to create more than just a place where people could buy 
            affordable active wear or sportswear in Pakistan. We wanted our customers 
            to be able to be true to their style, while maintaining tactile functionality. 
            We have tried to maximize comfort by designing our own unique measurement and fittings.
          </p>
        </div>
        <div className="values-grid">
          <div className="value-card value-card-fitness">
            <div className="value-card-overlay"></div>
            <h3 className="value-card-title">FITNESS WEARS</h3>
          </div>
          <div className="value-card value-card-sports">
            <div className="value-card-overlay"></div>
            <h3 className="value-card-title">SPORTS WEARS</h3>
          </div>
          <div className="value-card value-card-street">
            <div className="value-card-overlay"></div>
            <h3 className="value-card-title">STREET WEARS</h3>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="section products-section">
        <div className="products-background-image"></div>
        <div className="container">
          <h2 className="section-title">LATEST PRODUCTS.</h2>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="products-carousel-container">
              <button 
                className="products-arrow products-arrow-left"
                onClick={() => setProductIndex(prev => Math.max(0, prev - 1))}
                disabled={productIndex === 0}
                aria-label="Previous products"
              >
                ‹
              </button>
              <div className="products-grid">
                {products.slice(productIndex, productIndex + 3).map(product => (
                  <Link 
                    key={product.id} 
                    to={`/product/${product.id}`}
                    className="product-card product-card-link"
                  >
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
                      <span className="btn btn-outline">
                        Show Details
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <button 
                className="products-arrow products-arrow-right"
                onClick={() => setProductIndex(prev => Math.min(products.length - 3, prev + 1))}
                disabled={productIndex >= products.length - 3}
                aria-label="Next products"
              >
                ›
              </button>
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
          <h2 className="section-title newsletter-title">
            SUBSCRIBE TO OUR NEWSLETTER.
            <span className="title-dot"></span>
          </h2>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="text" 
              placeholder="Name*" 
              required
              name="name"
            />
            <input 
              type="email" 
              placeholder="E-Mail*" 
              required
              name="email"
            />
            <button type="submit" className="newsletter-subscribe-btn">Subscribe</button>
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
