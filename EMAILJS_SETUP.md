# EmailJS Setup - Automatic Email Without Configuration

✅ **EmailJS has been integrated!** This allows emails to be sent directly from the frontend without any backend email server configuration.

## Quick Setup (5 Minutes)

### Step 1: Create Free EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** (it's free - 200 emails/month)
3. Create an account (you can use your Gmail)

### Step 2: Create Email Service

1. After logging in, go to **"Email Services"**
2. Click **"Add New Service"**
3. Select **"Gmail"** (or your email provider)
4. Click **"Connect Account"** and authorize
5. **Copy the Service ID** (e.g., `service_xxxxxxx`)

### Step 3: Create Email Template

1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. Use this template:

**Template Name:** Contact Form Message

**Subject:** New Contact Form Message from {{from_name}}

**Content:**
```
New Contact Form Message from Furor Sport Website

Name: {{from_name}}
Email: {{from_email}}

Message:
{{message}}

---
This message was sent from the Furor Sport website contact form.
You can reply directly to {{from_email}}
```

4. **Copy the Template ID** (e.g., `template_xxxxxxx`)

### Step 4: Get Public Key

1. Go to **"Account"** → **"General"**
2. Find **"Public Key"**
3. **Copy the Public Key** (e.g., `xxxxxxxxxxxxx`)

### Step 5: Add to Environment Variables

Create or edit `.env` file in the `client` folder:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

**OR** if you don't have a `.env` file in client folder, you can hardcode them temporarily in `Contact.jsx` (not recommended for production).

### Step 6: Configure Email Recipient

In EmailJS dashboard:
1. Go to your **Email Template**
2. In the template settings, set **"To Email"** to: `Furorsport1@gmail.com`
3. Or add `{{to_email}}` in template and it will use the default

### Step 7: Restart Development Server

```bash
# Stop server (Ctrl+C) and restart
npm run dev
```

## How It Works

1. ✅ User fills contact form and clicks "Send Message"
2. ✅ EmailJS sends email directly to `Furorsport1@gmail.com`
3. ✅ Message is also saved to database (backup)
4. ✅ You receive email instantly!

## Testing

1. Fill out the contact form on your website
2. Submit the form
3. Check `Furorsport1@gmail.com` inbox
4. You should receive the email immediately!

## Benefits

- ✅ **No backend email server needed**
- ✅ **Works automatically** after one-time setup
- ✅ **Free tier:** 200 emails/month
- ✅ **No SMTP configuration**
- ✅ **Reliable delivery**

## Troubleshooting

### Emails not sending?

1. Check browser console for errors
2. Verify all three IDs are correct in `.env`
3. Make sure EmailJS service is connected
4. Check EmailJS dashboard for delivery status

### Need More Emails?

- Free tier: 200 emails/month
- Paid plans start at $15/month for 1,000 emails

## Alternative: Quick Test Without Setup

If you want to test immediately without EmailJS setup, the form will:
- Still save messages to database
- Show success message to user
- You can view messages in database or add admin panel feature later

---

**That's it!** Once you complete the 5-minute EmailJS setup, emails will work automatically forever!




