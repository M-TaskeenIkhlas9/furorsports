import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import './Navbar.css'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)

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
    const interval = setInterval(checkAdmin, 1000) // Check every second

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
    const cartInterval = setInterval(fetchCartCount, 2000) // Update every 2 seconds
    
    return () => {
      clearInterval(interval)
      clearInterval(cartInterval)
      window.removeEventListener('storage', checkAdmin)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="logo">
            <h1>Toledo Exporters</h1>
          </Link>
          
          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>HOME</Link>
            
            <div className="dropdown">
              <span className="dropdown-toggle">PRODUCTS <span className="chevron">▼</span></span>
              <div className="dropdown-menu">
                <Link to="/products?category=Martial Arts/Karate Uniforms" onClick={() => setIsMenuOpen(false)}>
                  MARTIAL ARTS/KARATE UNIFORMS
                </Link>
                
                <div className="dropdown-nested">
                  <span className="dropdown-nested-toggle">
                    SPORTS UNIFORMS <span className="chevron-right">▶</span>
                  </span>
                  <div className="dropdown-nested-menu">
                    <Link to="/products?category=Sports Uniforms" onClick={() => setIsMenuOpen(false)}>
                      SPORTS UNIFORMS
                    </Link>
                    <Link to="/products?category=Sports Uniforms&subcategory=American Football Uniforms" onClick={() => setIsMenuOpen(false)}>
                      AMERICAN FOOTBALL UNIFORMS
                    </Link>
                    <Link to="/products?category=Sports Uniforms&subcategory=Basketball Uniforms" onClick={() => setIsMenuOpen(false)}>
                      BASKETBALL UNIFORMS
                    </Link>
                    <Link to="/products?category=Sports Uniforms&subcategory=Goal Keeper Uniforms" onClick={() => setIsMenuOpen(false)}>
                      GOAL KEEPER UNIFORMS
                    </Link>
                    <Link to="/products?category=Sports Uniforms&subcategory=Soccer Uniforms" onClick={() => setIsMenuOpen(false)}>
                      SOCCER UNIFORMS
                    </Link>
                    <Link to="/products?category=Sports Uniforms&subcategory=Volleyball Uniforms" onClick={() => setIsMenuOpen(false)}>
                      VOLLEYBALL UNIFORMS
                    </Link>
                  </div>
                </div>
                
                <div className="dropdown-nested">
                  <span className="dropdown-nested-toggle">
                    STREET WEARS <span className="chevron-right">▶</span>
                  </span>
                  <div className="dropdown-nested-menu">
                    <Link to="/products?category=Street Wears" onClick={() => setIsMenuOpen(false)}>
                      STREET WEARS
                    </Link>
                    <Link to="/products?category=Street Wears&subcategory=Hoodies" onClick={() => setIsMenuOpen(false)}>
                      HOODIES
                    </Link>
                    <Link to="/products?category=Street Wears&subcategory=Jackets" onClick={() => setIsMenuOpen(false)}>
                      JACKETS
                    </Link>
                    <Link to="/products?category=Street Wears&subcategory=Polo Shirts" onClick={() => setIsMenuOpen(false)}>
                      POLO SHIRTS
                    </Link>
                    <Link to="/products?category=Street Wears&subcategory=T-Shirts" onClick={() => setIsMenuOpen(false)}>
                      T-SHIRTS
                    </Link>
                    <Link to="/products?category=Street Wears&subcategory=Track Suits" onClick={() => setIsMenuOpen(false)}>
                      TRACK SUITS
                    </Link>
                    <Link to="/products?category=Street Wears&subcategory=Training Vests" onClick={() => setIsMenuOpen(false)}>
                      TRAINING VESTS
                    </Link>
                  </div>
                </div>
                
                <div className="dropdown-nested">
                  <span className="dropdown-nested-toggle">
                    FITNESS WEARS <span className="chevron-right">▶</span>
                  </span>
                  <div className="dropdown-nested-menu">
                    <Link to="/products?category=Fitness Wears" onClick={() => setIsMenuOpen(false)}>
                      FITNESS WEARS
                    </Link>
                    <Link to="/products?category=Fitness Wears&subcategory=Compression Shirts" onClick={() => setIsMenuOpen(false)}>
                      COMPRESSION SHIRTS
                    </Link>
                    <Link to="/products?category=Fitness Wears&subcategory=Compression Shorts" onClick={() => setIsMenuOpen(false)}>
                      COMPRESSION SHORTS
                    </Link>
                    <Link to="/products?category=Fitness Wears&subcategory=Compression Suit" onClick={() => setIsMenuOpen(false)}>
                      COMPRESSION SUIT
                    </Link>
                    <Link to="/products?category=Fitness Wears&subcategory=Leggings" onClick={() => setIsMenuOpen(false)}>
                      LEGGINGS
                    </Link>
                    <Link to="/products?category=Fitness Wears&subcategory=Sports Bras" onClick={() => setIsMenuOpen(false)}>
                      SPORTS BRAS
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <Link to="/about" onClick={() => setIsMenuOpen(false)}>ABOUT US</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)}>CONTACT US</Link>
            <Link to="/how-to-order" onClick={() => setIsMenuOpen(false)}>HOW TO ORDER</Link>
            
            <Link 
              to={isAdmin ? "/admin/dashboard" : "/admin/login"} 
              className={`admin-link ${isAdmin ? 'admin-active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {isAdmin ? 'ADMIN PANEL' : 'ADMIN'}
              {isAdmin && <span className="admin-indicator">●</span>}
            </Link>
            
            <Link to="/cart" className="cart-link" onClick={() => setIsMenuOpen(false)}>
              <span>CART</span>
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

