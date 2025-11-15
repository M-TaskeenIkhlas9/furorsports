# How to Get Your Stripe Production API Keys

This guide will help you get your **real Stripe API keys** for your live website.

---

## Step 1: Sign Up / Login to Stripe

1. Go to: **https://stripe.com**
2. Click **"Sign in"** (if you already have an account) or **"Start now"** (to create a new account)
3. Login with your email and password

---

## Step 2: Complete Account Setup (If New Account)

If this is a new Stripe account:

1. **Complete your business information**:
   - Business name
   - Business type
   - Business address
   - Tax information
   - Bank account details (to receive payments)

2. **Verify your email** and complete identity verification

3. **Add your bank account** where you want to receive payments

**Note**: Stripe will need to verify your business before you can accept real payments. This usually takes 1-2 business days.

---

## Step 3: Get Your Production API Keys

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com

2. **Click on "Developers"** in the left sidebar (or go to: https://dashboard.stripe.com/apikeys)

3. **You'll see two sections**:
   - **Test mode** (for testing - these keys start with `sk_test_` and `pk_test_`)
   - **Live mode** (for real payments - these keys start with `sk_live_` and `pk_live_`)

4. **Make sure you're in "Live mode"**:
   - Look at the top right of the page
   - You should see a toggle that says **"Test mode"** or **"Live mode"**
   - **Switch to "Live mode"** (toggle should show "Live mode" is ON)

5. **Find your API keys**:
   - **Publishable key**: Starts with `pk_live_...`
     - Click **"Reveal"** to see the full key
     - Copy this key
   
   - **Secret key**: Starts with `sk_live_...`
     - Click **"Reveal"** to see the full key
     - Copy this key
     - ⚠️ **Keep this secret!** Don't share it publicly.

---

## Step 4: Send the Keys

Send both keys to your developer:

**Format to send:**

Please send both keys in this format:

1. **Publishable Key**: Copy the entire key that starts with `pk_live_`
2. **Secret Key**: Copy the entire key that starts with `sk_live_`

You can send them like this:
- Publishable Key: [paste your full key here]
- Secret Key: [paste your full key here]

**Important**: 
- ✅ Send via **secure email** or **private message**
- ❌ **Never** post these keys publicly
- ❌ **Never** share them on social media

---

## Step 5: Verify Your Account is Ready

Before your website can accept real payments, make sure:

- [ ] Your Stripe account is **verified**
- [ ] Your **business information** is complete
- [ ] Your **bank account** is added and verified
- [ ] You're using **Live mode keys** (not test keys)

---

## What's the Difference?

### Test Keys (Current - for testing only)
- Start with: `sk_test_` and `pk_test_`
- **Don't process real payments**
- Used for testing the website
- Free to use

### Live Keys (What you need - for real payments)
- Start with: `sk_live_` and `pk_live_`
- **Process real payments**
- Money goes to your bank account
- Stripe charges fees (usually 2.9% + $0.30 per transaction)

---

## Security Reminders

🔒 **Keep your Secret Key safe!**
- Only share with your developer
- Never post it online
- If you accidentally share it, you can **regenerate** it in Stripe Dashboard

---

## Need Help?

If you have trouble finding your keys:
1. Go to: https://dashboard.stripe.com/apikeys
2. Make sure you're in **"Live mode"** (not Test mode)
3. Look for keys starting with `pk_live_` and `sk_live_`

---

## After You Send the Keys

Once your developer receives the keys:
1. They will update your website
2. Your website will start accepting **real payments**
3. Money will be deposited to your bank account (usually within 2-7 business days)

---

**Questions?** Contact your developer if you need help!

