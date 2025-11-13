import { useState } from 'react'
import './Contact.css'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', message: '' })
      } else {
        alert('Error submitting form. Please try again.')
      }
    } catch (error) {
      alert('Error submitting form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="contact-page">
      <div className="contact-background-image"></div>
      <div className="container">
        <div className="page-header">
          <h1 className="contact-page-title">CONTACT US</h1>
        </div>
        
        <div className="contact-content">
          <div className="contact-info">
            <h2 className="contact-section-title">GET IN TOUCH</h2>
            <div className="info-item">
              <h3>WhatsApp</h3>
              <p>
                <a href="https://wa.me/923008522576" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  +92 300 8522576
                </a>
              </p>
            </div>
            <div className="info-item">
              <h3>Phone</h3>
              <p>+92 300 8522576</p>
            </div>
            <div className="info-item">
              <h3>Email</h3>
              <p>
                <a href="mailto:Furorsport1@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Furorsport1@gmail.com
                </a>
              </p>
            </div>
            <div className="info-item">
              <h3>Address</h3>
              <p>
                Latif Villas, Near Masjid Nawab Bibi,<br />
                Boota Road, Sialkot,<br />
                Punjab, Pakistan
              </p>
            </div>
          </div>

          <div className="contact-form-section">
            <h2 className="contact-section-title">SEND US A MESSAGE</h2>
            {submitted ? (
              <div className="success-message">
                <p>Thank you for your message! We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn-contact-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact

