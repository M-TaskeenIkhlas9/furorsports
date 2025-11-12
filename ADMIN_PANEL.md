# Admin Panel Documentation

## Overview

The admin panel allows your client to manage products, inventory, and orders without needing to modify code. It's a complete content management system built into the e-commerce website.

## Accessing the Admin Panel

1. Navigate to: `http://localhost:3000/admin/login`
2. Enter the admin password (default: `admin123`)
3. You'll be redirected to the dashboard

## Changing the Admin Password

Edit the `.env` file in the root directory:

```env
ADMIN_PASSWORD=your_secure_password_here
```

**Important:** After changing the password, restart the server for changes to take effect.

## Features

### 1. Dashboard (`/admin/dashboard`)

The dashboard provides an overview of:
- **Total Products**: Number of products in the catalog
- **Total Orders**: Number of orders received
- **Total Revenue**: Sum of all paid orders
- **Low Stock Items**: Products with stock less than 10
- **Pending Orders**: Orders awaiting processing

Quick action buttons:
- **Manage Products**: Go to product management
- **View Orders**: Go to order management
- **Add New Product**: Add a new product to the catalog

### 2. Product Management (`/admin/products`)

#### Viewing Products
- See all products in a table format
- View product ID, image, name, category, price, and stock
- Low stock items are highlighted in red

#### Adding a Product
1. Click the **"+ Add Product"** button
2. Fill in the form:
   - **Product Name** (required)
   - **Price** (required, in USD)
   - **Description** (optional)
   - **Category** (required) - Select from dropdown
   - **Subcategory** (optional) - Appears based on category
   - **Image URL** (optional) - Path to product image
   - **Stock Quantity** (default: 100)
3. Click **"Add Product"**

#### Editing a Product
1. Click the **"Edit"** button next to any product
2. Modify the fields as needed
3. Click **"Update Product"**

#### Deleting a Product
1. Click the **"Delete"** button next to any product
2. Confirm the deletion
3. The product will be permanently removed

#### Image Paths
When adding images, use paths relative to the `client/public` directory:
- Example: `/images/products/example.jpg`
- Images should be placed in: `client/public/images/products/`

### 3. Order Management (`/admin/orders`)

#### Viewing Orders
- See all orders in a table
- View order number, customer name, date, amount, status, and payment status
- Click on any order to view details

#### Order Details
When you click on an order, you'll see:
- **Order Information**: Order number, date, total amount, status
- **Customer Information**: Name, email, phone, address
- **Order Items**: List of products with quantities and prices

#### Updating Order Status
Use the status buttons to update an order:
- **Processing**: Order is being prepared
- **Shipped**: Order has been shipped
- **Delivered**: Order has been delivered
- **Cancel**: Cancel the order

## Categories and Subcategories

### Available Categories:
1. **Martial Arts/Karate Uniforms**
2. **Sports Uniforms**
   - American Football Uniforms
   - Basketball Uniforms
   - Goal Keeper Uniforms
   - Soccer Uniforms
   - Volleyball Uniforms
3. **Street Wears**
   - Hoodies
   - Jackets
   - Polo Shirts
   - T-Shirts
   - Track Suits
   - Training Vests
4. **Fitness Wears**
   - Compression Shirts
   - Compression Shorts
   - Compression Suit
   - Leggings
   - Sports Bras

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change the default password** before deploying to production
2. The current authentication is password-based and stored in localStorage
3. For production, consider implementing:
   - JWT tokens
   - Session management
   - Role-based access control
   - Rate limiting
   - HTTPS only

## API Endpoints

All admin endpoints are prefixed with `/api/admin`:

- `POST /api/admin/login` - Admin login
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Add new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get order details
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/categories` - Get all categories

## Troubleshooting

### Can't access admin panel
- Make sure you're using the correct URL: `/admin/login`
- Check that the server is running
- Clear browser cache and localStorage

### Products not saving
- Check that all required fields are filled
- Verify the server is running and connected to the database
- Check browser console for errors

### Images not showing
- Ensure image paths start with `/images/`
- Images must be in `client/public/images/` directory
- Check file extensions match the path in the database

## Support

For issues or questions, check:
1. Server logs in the terminal
2. Browser console for frontend errors
3. Database file: `server/database/ecommerce.db`

