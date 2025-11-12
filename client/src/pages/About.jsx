import './About.css'

const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        <h1>About Us</h1>
        
        <section className="about-section">
          <h2>Who We Are</h2>
          <p>
            TOLEDO EXPORTERS is a Family Owned company from Sialkot in Pakistan, 
            that has been manufacturing high quality Professional Sports Wears, 
            Fitness Wears, Casual Wear and all kinds of Street Wears equipment. 
            Our products are shipped and delivered all around the World to countless 
            satisfied Athletes that use our gear.
          </p>
          <p>
            Our specialty is the ability to manufacture and ship our huge range of 
            products at such lucrative prices, as well as ensuring our customer's 
            satisfaction 100% at all times. Our product speaks for themselves and 
            our consistency in delivery and quality is unmatched.
          </p>
          <p>
            We look forward to providing with you with the best quality gear that 
            gets you the Gold!!
          </p>
        </section>

        <section className="values-section">
          <h2>Our Core Values</h2>
          <p>
            Our vision was to create more than just a place where people could buy 
            affordable active wear or sportswear in Pakistan. We wanted our customers 
            to be able to be true to their style, while maintaining tactile functionality. 
            We have tried to maximize comfort by designing our own unique measurement and fittings.
          </p>
          
          <div className="values-grid">
            <div className="value-item">
              <h3>Minimum Quantity</h3>
              <p>We offer flexible minimum order quantities to accommodate businesses of all sizes.</p>
            </div>
            <div className="value-item">
              <h3>Low Pricing</h3>
              <p>Competitive prices without compromising on quality - we believe in value for money.</p>
            </div>
            <div className="value-item">
              <h3>Our Experience</h3>
              <p>Years of expertise in manufacturing sports wear and fitness equipment.</p>
            </div>
            <div className="value-item">
              <h3>High Quality</h3>
              <p>Premium materials and craftsmanship in every product we manufacture.</p>
            </div>
            <div className="value-item">
              <h3>Sample & Prototypes</h3>
              <p>We provide samples and prototypes before bulk orders to ensure customer satisfaction.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About

