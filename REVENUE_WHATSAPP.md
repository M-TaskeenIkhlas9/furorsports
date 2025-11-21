# Revenue Tracking with WhatsApp Orders

## How Revenue Works Now

With WhatsApp-based ordering, revenue is tracked based on **order status** instead of payment status. This makes sense because:

- **Pending orders** = Payment not yet received (don't count as revenue)
- **Processing orders** = Payment received, order confirmed (count as revenue)
- **Shipped orders** = Payment received, order dispatched (count as revenue)
- **Delivered orders** = Payment received, order completed (count as revenue)
- **Cancelled orders** = Never count as revenue

## Revenue Calculation Logic

### What Counts as Revenue

Revenue is calculated from orders with status:
- ✅ `processing` - Payment received, order being prepared
- ✅ `shipped` - Order dispatched to customer
- ✅ `delivered` - Order completed

### What Doesn't Count

- ❌ `pending` - Payment not yet confirmed
- ❌ `cancelled` / `canceled` - Order cancelled

## Workflow

### 1. Order Created (Pending)
- Customer places order via WhatsApp
- Order created with status: `pending`
- **Revenue: $0** (not counted yet)

### 2. Payment Received (Processing)
- You receive payment via WhatsApp/bank transfer
- Update order status to: `processing`
- **Revenue: Counted** ✅

### 3. Order Shipped
- Update status to: `shipped`
- **Revenue: Still counted** ✅

### 4. Order Delivered
- Update status to: `delivered`
- **Revenue: Still counted** ✅

## Revenue Reports

All revenue reports now show:
- **Today's Revenue**: Orders with confirmed status created today
- **This Week's Revenue**: Orders with confirmed status from last 7 days
- **This Month's Revenue**: Orders with confirmed status from current month
- **Total Revenue**: All orders with confirmed status (ever)

## Important Notes

### When to Update Order Status

1. **After receiving payment** → Update to `processing`
   - This is when revenue starts counting
   - Order appears in revenue reports

2. **When order ships** → Update to `shipped`
   - Revenue continues to count
   - Useful for tracking fulfillment

3. **When customer receives** → Update to `delivered`
   - Revenue continues to count
   - Marks order as complete

### Revenue Tracking Tips

- ✅ **Always update status to "processing"** when payment is received
- ✅ Revenue automatically updates in all reports
- ✅ No need to manually mark as "paid"
- ✅ Cancelled orders never count (even if they were processing)

## Example Scenario

**Day 1:**
- Customer orders $100 via WhatsApp
- Order status: `pending`
- Revenue: $0

**Day 2:**
- You receive $100 payment
- Update order status: `processing`
- Revenue: **$100** ✅ (counted in today's revenue)

**Day 3:**
- Order ships
- Update order status: `shipped`
- Revenue: **$100** ✅ (still counted)

**Day 5:**
- Customer receives order
- Update order status: `delivered`
- Revenue: **$100** ✅ (still counted)

## Dashboard & Reports

### Admin Dashboard
- Shows total revenue from all confirmed orders
- Updates automatically when order status changes

### Revenue Page
- Daily/Weekly/Monthly breakdowns
- Shows revenue from confirmed orders only
- Can filter by specific month/year

### Analytics
- Charts show revenue trends
- Based on order creation date
- Only includes confirmed orders

## Migration Notes

If you have old Stripe orders with `payment_status = 'paid'`:
- They will still show in revenue if status is `processing`, `shipped`, or `delivered`
- If status is `pending` but payment_status is `paid`, update status to `processing` to count in revenue

## Troubleshooting

### Revenue not showing?
- Check order status is `processing`, `shipped`, or `delivered`
- Verify order is not `cancelled`
- Check order date is within the selected time period

### Revenue seems incorrect?
- Review order statuses in admin panel
- Ensure cancelled orders are marked as `cancelled`
- Check for duplicate orders

### Need to exclude an order?
- Update order status to `cancelled`
- It will be removed from all revenue calculations

