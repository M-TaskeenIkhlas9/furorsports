# Stripe Payment Integration Setup

## Overview
The ecommerce website now includes Stripe payment integration. Customers can securely pay for their orders using credit/debit cards through Stripe Checkout.

## Setup Instructions

### 1. Create a Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete the account setup process

### 2. Get Your Stripe API Keys

#### For Testing (Development):
1. Log in to your Stripe Dashboard
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

#### For Production:
1. Switch to **Live mode** in Stripe Dashboard
2. Copy your **Publishable key** (starts with `pk_live_`)
3. Copy your **Secret key** (starts with `sk_live_`)

### 3. Configure Environment Variables

Create or update the `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Client URL (for redirects after payment)
CLIENT_URL=http://localhost:3000

# Optional: For webhook verification (production)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Install Dependencies

The Stripe package is already added to `package.json`. Install it:

```bash
npm install
```

### 5. Test the Integration

#### Using Test Cards:
Stripe provides test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any:
- Future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any postal code

## How It Works

### Payment Flow:
1. Customer fills out checkout form with shipping information
2. Clicks "Pay with Stripe" button
3. Redirected to Stripe Checkout page
4. Enters payment details securely on Stripe's servers
5. After successful payment, redirected back to success page
6. Order is automatically created and cart is cleared

### Backend Routes:
- `POST /api/payment/create-checkout-session` - Creates Stripe checkout session
- `POST /api/payment/verify-payment` - Verifies payment and creates order
- `POST /api/payment/webhook` - Webhook endpoint for Stripe events (optional)

## Database Updates

The orders table now includes:
- `payment_intent_id` - Stripe payment intent ID
- `payment_status` - Payment status (pending, paid, failed)

## Security Notes

1. **Never commit your secret keys to version control**
2. Keep your `.env` file in `.gitignore`
3. Use test keys for development
4. Only use live keys in production
5. Enable webhook verification in production for security

## Troubleshooting

### Payment Not Working:
1. Check that Stripe keys are correctly set in `.env`
2. Verify the keys are for the correct mode (test/live)
3. Check server logs for errors
4. Ensure `CLIENT_URL` matches your frontend URL

### Redirect Issues:
- Make sure `CLIENT_URL` in `.env` matches your frontend URL
- Check that success/cancel URLs are correctly configured

### Test Mode vs Live Mode:
- Test mode: Use test cards, no real charges
- Live mode: Real payments, real charges
- Switch modes in Stripe Dashboard

## Production Deployment

1. Switch to live mode in Stripe Dashboard
2. Update `.env` with live keys
3. Set up webhook endpoint (recommended)
4. Update `CLIENT_URL` to your production domain
5. Test with a small real transaction first

## Support

For Stripe-related issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

