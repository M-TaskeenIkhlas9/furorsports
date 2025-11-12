import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Toledo Exporters</h3>
            <p>
              TOLEDO EXPORTERS is a Family Owned company from Sialkot in Pakistan, 
              that has been manufacturing high quality Professional Sports Wear, 
              Fitness Wear, Casual Wear and all kinds of Martial Arts equipment.
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Contact Info</h3>
            <p><strong>WhatsApp:</strong> +92-330-8317171</p>
            <p><strong>Phone:</strong> +92-305-6261571</p>
            <p><strong>Email:</strong> info@toledoexporters.com</p>
            <p>
              <strong>Address:</strong> Defence Road Touheed Town Street 8D, 
              Sialkot-51310, Punjab, Pakistan.
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <Link to="/products">Products</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/how-to-order">How To Order</Link>
          </div>
          
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="#" target="_blank" rel="noopener noreferrer">Pinterest</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Toledo Exporters. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

