# Email Setup Guide for Contact Form

The contact form now sends email notifications to your email address when someone submits a message.

## Setup Instructions

### Option 1: Gmail (Recommended for Quick Setup)

1. **Enable 2-Step Verification** on your Gmail account:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate an App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "Furor Sport Website" as the name
   - Copy the 16-character password generated

3. **Add to `.env` file**:
   ```env
   # Email Configuration (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_FROM_NAME=Furor Sport Website
   CONTACT_EMAIL=Furorsport1@gmail.com
   ```

### Option 2: Other Email Providers

#### Outlook/Hotmail:
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Yahoo:
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

#### Custom SMTP Server:
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-username
EMAIL_PASS=your-password
EMAIL_FROM_NAME=Furor Sport Website
CONTACT_EMAIL=Furorsport1@gmail.com
```

## Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com          # SMTP server hostname
EMAIL_PORT=587                      # SMTP port (587 for TLS, 465 for SSL)
EMAIL_SECURE=false                  # true for SSL (port 465), false for TLS (port 587)
EMAIL_USER=your-email@gmail.com     # Your email address
EMAIL_PASS=your-app-password        # Your email password or app password
EMAIL_FROM_NAME=Furor Sport Website # Display name for sent emails
CONTACT_EMAIL=Furorsport1@gmail.com # Email address to receive contact form messages
```

## How It Works

1. **User submits contact form** → Message is saved to database
2. **Email is automatically sent** → Notification sent to `CONTACT_EMAIL`
3. **You receive email** → With customer's name, email, and message
4. **You can reply directly** → Reply-to is set to customer's email

## Testing

1. Fill out the contact form on your website
2. Check your email inbox (`Furorsport1@gmail.com`)
3. You should receive a formatted email with the message details

## Troubleshooting

### Email not sending?

1. **Check `.env` file** - Make sure all email variables are set
2. **Check email credentials** - Verify username and password are correct
3. **Check server logs** - Look for email error messages
4. **Gmail users** - Make sure you're using an App Password, not your regular password
5. **Firewall/Security** - Some email providers block SMTP from unknown locations

### Still not working?

- The contact form will still save messages to the database even if email fails
- You can view messages in the database or add an admin panel feature to view them
- Consider using a service like SendGrid, Mailgun, or AWS SES for production

## Production Recommendations

For production, consider using:
- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **AWS SES** (Very affordable, pay per email)
- **Postmark** (Great deliverability)

These services are more reliable than SMTP and have better deliverability rates.


