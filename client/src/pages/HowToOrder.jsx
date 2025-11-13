import './HowToOrder.css'

const HowToOrder = () => {
  return (
    <div className="how-to-order-page">
      <div className="order-background-image"></div>
      <div className="container">
        <div className="page-header">
          <h1 className="order-page-title">HOW TO ORDER</h1>
        </div>
        
        <section className="order-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h2>Browse Products</h2>
              <p>
                Explore our wide range of products including Sports Uniforms, 
                Fitness Wears, Street Wears, and Martial Arts equipment. 
                Use the category filters to find exactly what you're looking for.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h2>Add to Cart</h2>
              <p>
                Click on any product to view details, select your desired quantity, 
                and add it to your shopping cart. You can continue shopping and 
                add more items to your cart.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h2>Review Your Cart</h2>
              <p>
                Go to your shopping cart to review all selected items. You can 
                update quantities or remove items before proceeding to checkout.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h2>Checkout</h2>
              <p>
                Provide your shipping information including name, email, address, 
                city, and country. Review your order summary and place your order.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h2>Order Confirmation</h2>
              <p>
                After placing your order, you'll receive an order confirmation 
                with your unique order number. We'll process your order and 
                contact you regarding shipping details.
              </p>
            </div>
          </div>
        </section>

        <section className="additional-info">
          <h2 className="info-section-title">ADDITIONAL INFORMATION</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Custom Orders</h3>
              <p>
                For custom orders or bulk quantities, please contact us directly 
                via email or WhatsApp. We can provide samples and prototypes 
                before bulk orders.
              </p>
            </div>
            <div className="info-card">
              <h3>Shipping</h3>
              <p>
                We ship worldwide. Shipping costs and delivery times vary by 
                location. Contact us for specific shipping information for your area.
              </p>
            </div>
            <div className="info-card">
              <h3>Payment</h3>
              <p>
                Payment terms can be discussed based on order size. We accept 
                various payment methods. Contact us for more details.
              </p>
            </div>
            <div className="info-card">
              <h3>Minimum Order</h3>
              <p>
                We offer flexible minimum order quantities. Contact us to discuss 
                your specific requirements and we'll work with you to find the 
                best solution.
              </p>
            </div>
          </div>
        </section>

        <section className="contact-cta">
          <h2 className="cta-title">NEED HELP?</h2>
          <p>
            If you have any questions about ordering or need assistance, 
            please don't hesitate to contact us:
          </p>
          <div className="contact-details">
            <p>
              <strong>WhatsApp:</strong>{' '}
              <a href="https://wa.me/923008522576" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                +92 300 8522576
              </a>
            </p>
            <p><strong>Email:</strong> info@furorsport.com</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HowToOrder

