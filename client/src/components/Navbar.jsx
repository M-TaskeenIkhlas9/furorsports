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
          
          {/* Right Section - Admin, Cart */}
          <div className="nav-right">
            {/* Admin Link - Only visible to authenticated admins */}
            {isAdmin && (
              <Link 
                to="/admin/dashboard" 
                className={`admin-link admin-active`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Panel
                <span className="admin-indicator">●</span>
              </Link>
            )}
            
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
