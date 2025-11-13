import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import './Navbar.css'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const location = useLocation()

  useEffect(() => {
    // Get or create session ID
    let sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = uuidv4()
      localStorage.setItem('sessionId', sessionId)
    }

    // Check admin authentication
    const checkAdmin = () => {
      const adminAuth = localStorage.getItem('adminAuthenticated')
      setIsAdmin(adminAuth === 'true')
    }
    checkAdmin()
    
    // Listen for storage changes (when admin logs in/out in another tab)
    window.addEventListener('storage', checkAdmin)
    const interval = setInterval(checkAdmin, 1000)

    // Fetch cart count
    const fetchCartCount = async () => {
      try {
        const response = await fetch(`/api/cart/${sessionId}`)
        if (response.ok) {
          const items = await response.json()
          const count = items.reduce((sum, item) => sum + item.quantity, 0)
          setCartCount(count)
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
      }
    }

    fetchCartCount()
    const cartInterval = setInterval(fetchCartCount, 2000)
    
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
    
    return () => {
      clearInterval(interval)
      clearInterval(cartInterval)
      window.removeEventListener('storage', checkAdmin)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const isProductsActive = location.pathname === '/products' || location.pathname.startsWith('/product')

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          {/* Logo - Far Left */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              <span className="logo-fs">FS</span>
            </div>
            <div className="logo-text">
              <div className="logo-text-top">FUROR SPORT</div>
              <div className="logo-text-bottom">(FS)</div>
            </div>
          </Link>
          
          {/* Navigation Links - Center */}
          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            <div 
              className="nav-separator"
            ></div>
            
            <div 
              className={`dropdown ${isProductsActive ? 'active' : ''}`}
              onMouseEnter={() => setProductsDropdownOpen(true)}
              onMouseLeave={() => setProductsDropdownOpen(false)}
            >
              <Link 
                to="/products" 
                className={`nav-link products-link ${isProductsActive || productsDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              
              <div className={`products-dropdown ${productsDropdownOpen ? 'open' : ''}`}>
                {categories.map((category, index) => (
                  <div key={category.id || index}>
                    {index > 0 && <div className="dropdown-divider"></div>}
                    <div 
                      className="dropdown-column"
                      onMouseEnter={() => {
                        // Only set hovered if category has subcategories
                        if (category.subcategories && category.subcategories.length > 0) {
                          setHoveredCategory(category.name);
                        }
                      }}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <Link 
                        to={`/products?category=${encodeURIComponent(category.name)}`} 
                        className="dropdown-category"
                      >
                        {category.name}
                      </Link>
                      {hoveredCategory === category.name && category.subcategories && category.subcategories.length > 0 && (
                        <div className="subcategories-container">
                          {category.subcategories.map(sub => (
                            <Link 
                              key={sub.id} 
                              to={`/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(sub.name)}`} 
                              className="dropdown-subcategory"
                            >
                              <span className="chevron-bullet">▶</span>
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="nav-separator"></div>
            
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            
            <div className="nav-separator"></div>
            
            <Link 
              to="/contact" 
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
            
            <div className="nav-separator"></div>
            
            <Link 
              to="/how-to-order" 
              className={`nav-link ${isActive('/how-to-order') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              How To Order
            </Link>
          </div>
          
          {/* Right Section - Social Icons, Admin, Cart */}
          <div className="nav-right">
            {/* Social Media Icons */}
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="mailto:Furorsport1@gmail.com" className="social-icon" aria-label="Email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
                </svg>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Pinterest">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.372 0 12s5.373 12 12 12c5.084 0 9.426-3.163 11.174-7.637-.15-.688-.85-3.9.343-5.456.9-1.2 2.3-4.5 2.3-4.5s.6-1.2.6-2.9c0-2.7-1.6-4.7-3.6-4.7-1.7 0-2.4 1.3-2.4 2.8 0 1 .3 1.7.7 2.1.1.1.1.2.1.3-.1.3-.3 1.1-.3 1.2-.1.2-.2.3-.4.2-1.5-.7-2.4-2.9-2.4-4.7 0-3.8 2.8-7.3 7.1-7.3 3.7 0 6.6 2.7 6.6 6.3 0 3.7-2.3 6.7-5.7 6.7-1.1 0-2.2-.6-2.6-1.3l-.7 2.8c-.3 1.1-1.1 2.5-1.6 3.3 1.2.4 2.5.6 3.8.6 6.627 0 12-5.372 12-12S18.627 0 12 0z"/>
                </svg>
              </a>
            </div>
            
            {/* Admin Link */}
            <Link 
              to={isAdmin ? "/admin/dashboard" : "/admin/login"} 
              className={`admin-link ${isAdmin ? 'admin-active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {isAdmin ? 'Admin Panel' : 'Admin'}
              {isAdmin && <span className="admin-indicator">●</span>}
            </Link>
            
            {/* Cart Link */}
            <Link to="/cart" className="cart-link" onClick={() => setIsMenuOpen(false)}>
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
          
          <button className="menu-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
