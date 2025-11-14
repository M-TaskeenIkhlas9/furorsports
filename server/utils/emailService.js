const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email service not configured. Contact form messages will only be saved to database.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send contact form email
const sendContactEmail = async (contactData) => {
  const { name, email, message } = contactData;
  const recipientEmail = process.env.CONTACT_EMAIL || 'Furorsport1@gmail.com';

  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Email not sent - email service not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Furor Sport Website'}" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    replyTo: email, // Allow replying directly to the customer
    subject: `New Contact Form Message from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .info-item { margin: 15px 0; }
          .label { font-weight: bold; color: #FF6B35; }
          .message-box { background: white; padding: 15px; border-left: 4px solid #FF6B35; margin-top: 15px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Message</h2>
          </div>
          <div class="content">
            <div class="info-item">
              <span class="label">Name:</span> ${name}
            </div>
            <div class="info-item">
              <span class="label">Email:</span> <a href="mailto:${email}">${email}</a>
            </div>
            <div class="info-item">
              <span class="label">Message:</span>
              <div class="message-box">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            <div class="info-item">
              <span class="label">Submitted:</span> ${new Date().toLocaleString()}
            </div>
          </div>
          <div class="footer">
            <p>This message was sent from the Furor Sport website contact form.</p>
            <p>You can reply directly to this email to respond to ${name}.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Contact Form Message from Furor Sport Website

Name: ${name}
Email: ${email}
Message:
${message}

Submitted: ${new Date().toLocaleString()}

---
This message was sent from the Furor Sport website contact form.
You can reply directly to this email to respond to ${name}.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { success: false, error: error.message };
  }
};

// Send order confirmation email to customer
const sendOrderConfirmationEmail = async (orderData) => {
  const { orderNumber, customerName, customerEmail, totalAmount, items, shippingAddress } = orderData;
  
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Order confirmation email not sent - email service not configured');
    return { success: false, error: 'Email service not configured' };
  }

  // Format order items
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Furor Sport'}" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF6B35; color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .order-info { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .order-number { font-size: 24px; font-weight: bold; color: #FF6B35; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #FF6B35; color: white; padding: 12px; text-align: left; }
          .total { font-size: 20px; font-weight: bold; color: #FF6B35; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase, ${customerName}!</p>
          </div>
          <div class="content">
            <div class="order-info">
              <p><strong>Order Number:</strong></p>
              <div class="order-number">${orderNumber}</div>
              <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <h3>Order Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">
              <strong>Total Amount: $${totalAmount.toFixed(2)}</strong>
            </div>

            ${shippingAddress ? `
            <div class="order-info">
              <h3>Shipping Address</h3>
              <p>${shippingAddress}</p>
            </div>
            ` : ''}

            <p style="margin-top: 30px;">
              We're processing your order and will send you a shipping confirmation email once your items are on their way.
            </p>
            
            <p>If you have any questions, please contact us at <a href="mailto:Furorsport1@gmail.com">Furorsport1@gmail.com</a></p>
          </div>
          <div class="footer">
            <p>Thank you for shopping with Furor Sport!</p>
            <p>© ${new Date().getFullYear()} Furor Sport. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Order Confirmation - ${orderNumber}

Thank you for your purchase, ${customerName}!

Order Number: ${orderNumber}
Order Date: ${new Date().toLocaleString()}

Order Items:
${items.map(item => `- ${item.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total Amount: $${totalAmount.toFixed(2)}

${shippingAddress ? `Shipping Address:\n${shippingAddress}\n` : ''}

We're processing your order and will send you a shipping confirmation email once your items are on their way.

If you have any questions, please contact us at Furorsport1@gmail.com

Thank you for shopping with Furor Sport!
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendContactEmail,
  sendOrderConfirmationEmail
};

