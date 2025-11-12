# ⚠️ IMPORTANT: Server Restart Required

## The Issue
The server needs to be restarted to load the Stripe API keys from the `.env` file.

## How to Fix

### Step 1: Stop the Current Server
In your terminal where `npm run dev` is running:
- Press `Ctrl + C` to stop the server

### Step 2: Restart the Server
```bash
npm run dev
```

## Why This is Needed
When the server first started, the `.env` file didn't exist yet. The environment variables are loaded when the server starts, so it needs to be restarted to pick up the new Stripe API keys.

## Verification
After restarting, you should see:
- `Server is running on port 5000`
- `Connected to SQLite database`

If you see any Stripe-related errors, check that:
1. The `.env` file exists in the root directory
2. The `STRIPE_SECRET_KEY` is set correctly
3. The server was restarted after creating the `.env` file

## Test After Restart
1. Go to checkout page
2. Fill in shipping information
3. Click "Pay with Stripe"
4. You should be redirected to Stripe Checkout (not see an error)

