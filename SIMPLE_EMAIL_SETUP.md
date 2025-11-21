# Simple Email Setup - Works Immediately!

✅ **The contact form is now ready!** It works in two ways:

## Option 1: Automatic Email (Recommended - 5 min setup)

### Quick EmailJS Setup:

1. **Go to:** https://www.emailjs.com/
2. **Sign up** (free - 200 emails/month)
3. **Add Email Service:**
   - Click "Email Services" → "Add New Service"
   - Choose "Gmail" → Connect your Gmail account
   - **Copy the Service ID** (looks like: `service_xxxxxxx`)

4. **Create Template:**
   - Click "Email Templates" → "Create New Template"
   - **To Email:** `Furorsport1@gmail.com`
   - **Subject:** `New Contact: {{from_name}}`
   - **Content:**
     ```
     Name: {{from_name}}
     Email: {{from_email}}
     
     Message:
     {{message}}
     ```
   - **Copy the Template ID** (looks like: `template_xxxxxxx`)

5. **Get Public Key:**
   - Go to "Account" → "General"
   - **Copy the Public Key**

6. **Add to `.env` file in `client` folder:**
   ```env
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

7. **Restart server:** `npm run dev`

**Done!** Emails will now send automatically to `Furorsport1@gmail.com` when someone submits the form.

---

## Option 2: Works Right Now (No Setup Needed)

If EmailJS is not configured, the form will:
- ✅ Open your email client (Gmail, Outlook, etc.)
- ✅ Pre-fill the message with customer details
- ✅ Address it to `Furorsport1@gmail.com`
- ✅ Save message to database

**This works immediately without any setup!**

---

## Which Option to Use?

- **Option 1 (EmailJS):** Fully automatic - emails sent directly to inbox
- **Option 2 (Mailto):** Works immediately - opens email client (user clicks send)

Both options save messages to the database as backup.

---

## Current Status

✅ **Right now:** Option 2 works immediately (opens email client)
✅ **After EmailJS setup:** Option 1 works automatically (emails sent directly)

The form is ready to use right now!




