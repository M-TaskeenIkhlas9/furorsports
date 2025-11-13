# How Products Appear on Home Page

## Flow: Admin Adds Product → Appears on Home Page

### Step-by-Step Process:

1. **Admin Adds Product** (via Admin Panel):
   - Admin goes to `/admin/products`
   - Clicks "+ Add Product"
   - Fills in product details (name, price, image, category, etc.)
   - Clicks "Add Product"

2. **Product Saved to Database**:
   - Product is inserted into the `products` table
   - Automatically gets a `created_at` timestamp (current date/time)
   - This timestamp is used to determine the "newest" products

3. **Home Page Fetches Products**:
   - Home page automatically fetches products when it loads
   - API endpoint: `/api/products?limit=8`
   - Backend returns products **ordered by newest first** (`ORDER BY created_at DESC`)
   - Only the 8 most recent products are returned

4. **Products Displayed on Home Page**:
   - The "Latest Products" section shows the 8 newest products
   - Products are displayed in a carousel (3 at a time)
   - Users can navigate through all 8 products using arrow buttons

### Key Points:

✅ **Automatic**: No manual action needed - new products appear automatically  
✅ **Newest First**: Most recently added products appear first  
✅ **Real-time**: When admin adds a product, it will appear on the home page after a page refresh  
✅ **Sorted by Date**: Products are sorted by `created_at` timestamp (newest to oldest)

### Technical Details:

- **Database**: Products table has `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- **API**: `/api/products` endpoint orders by `created_at DESC`
- **Frontend**: Home page fetches `/api/products?limit=8` to get the 8 newest products
- **Display**: Shows 3 products at a time in a carousel format

### To See New Products Immediately:

1. Admin adds a product
2. Refresh the home page (or navigate away and back)
3. New product will appear in the "Latest Products" section

---

## All Products Page

The "Products" page (`/products`) shows **all products** (not just the latest 8), also sorted by newest first.

---

## Notes:

- Products are automatically sorted by creation date
- The home page shows the 8 most recent products
- The full products page shows all products
- No manual configuration needed - it works automatically!

