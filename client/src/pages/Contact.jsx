import { useState } from 'react'
import emailjs from '@emailjs/browser'
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
      // Try EmailJS first (if configured)
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

      if (serviceId && templateId && publicKey) {
        // EmailJS is configured - send email automatically
        const emailParams = {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: 'Furorsport1@gmail.com',
          to_name: 'Furor Sport'
        }

        await emailjs.send(serviceId, templateId, emailParams, publicKey)
        console.log('Email sent successfully via EmailJS')
      } else {
        // EmailJS not configured - use mailto: as fallback (works immediately, no setup needed)
        const subject = encodeURIComponent(`Contact Form Message from ${formData.name}`)
        const body = encodeURIComponent(
          `Name: ${formData.name}\n` +
          `Email: ${formData.email}\n\n` +
          `Message:\n${formData.message}\n\n` +
          `---\n` +
          `This message was sent from the Furor Sport website contact form.`
        )
        const mailtoLink = `mailto:Furorsport1@gmail.com?subject=${subject}&body=${body}&reply-to=${encodeURIComponent(formData.email)}`
        
        // Open email client in new window/tab to keep page open
        window.open(mailtoLink, '_blank')
        
        // Small delay to ensure email client opens
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Also save to database (backup)
      try {
        await fetch('/api/contact/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } catch (dbError) {
        console.log('Database save failed, but email was sent')
      }

      setSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      console.error('Error:', error)
      // Fallback: use mailto: if EmailJS fails
      try {
        const subject = encodeURIComponent(`Contact Form Message from ${formData.name}`)
        const body = encodeURIComponent(
          `Name: ${formData.name}\n` +
          `Email: ${formData.email}\n\n` +
          `Message:\n${formData.message}\n\n` +
          `---\n` +
          `This message was sent from the Furor Sport website contact form.`
        )
        const mailtoLink = `mailto:Furorsport1@gmail.com?subject=${subject}&body=${body}&reply-to=${encodeURIComponent(formData.email)}`
        window.open(mailtoLink, '_blank')
        
        // Save to database
        await fetch('/api/contact/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        setSubmitted(true)
        setFormData({ name: '', email: '', message: '' })
      } catch (fallbackError) {
        alert('Error submitting form. Please contact us directly at Furorsport1@gmail.com')
      }
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
              <h3>Instagram</h3>
              <p>
                <a 
                  href="https://www.instagram.com/furorsport_?igsh=cW9qYWJwNDloMTAy" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  @furorsport_
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
                <p>✅ Thank you for your message!</p>
                <p>Your message has been sent to Furorsport1@gmail.com. We'll get back to you soon.</p>
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

