# Furor Sport Ecommerce Website

A full-stack ecommerce website for Furor Sport, featuring professional sports wear, fitness wear, and street wear products.

## Features

### Customer Features
- **Product Catalog**: Browse products by category (Sports Uniforms, Fitness Wears, Street Wears, Martial Arts/Karate Uniforms)
- **Clickable Product Cards**: Entire product cards are clickable for quick navigation to product details
- **Product Variants**: Select sizes and colors for products
- **Multiple Product Images**: Image carousel with navigation for product details
- **Sale Prices**: Special pricing with visual sale badges
- **Shopping Cart**: Add products to cart, update quantities, and manage items
- **WhatsApp Ordering**: Order directly via WhatsApp with formatted order details
- **Product Details**: Detailed product pages with descriptions, pricing, and variants
- **Newsletter Subscription**: Subscribe to newsletter updates
- **Contact Form**: Send messages to the company
- **Social Media**: Quick access via floating WhatsApp and Instagram buttons
- **Responsive Design**: Mobile-friendly interface across all devices

### Admin Features
- **Admin Dashboard**: Comprehensive overview with statistics and recent orders
- **Product Management**: Full CRUD operations for products with multiple images
- **Order Management**: View, update status, and manage all customer orders
- **Customer Management**: 
  - View customer details and order history
  - Sticky header with customer information
  - In-modal order details view (no navigation away from customer page)
  - Complete order information with items, images, and variants
- **Revenue Analytics**: Track revenue with period and month/year filters
- **Shipping Labels**: Export order details with product images for shipping
- **CSV Export**: Export orders data for external analysis
- **Search & Filters**: Advanced search and filtering for products and orders
- **Stock Management**: Low stock alerts and inventory tracking

## Technology Stack

### Backend
- Node.js
- Express.js
- SQLite (database)
- WhatsApp API integration (for ordering)
- Email service (Nodemailer) for notifications
- RESTful API

### Frontend
- React 18
- React Router DOM
- Vite (build tool)
- CSS3 (responsive design)

## Project Structure

```
ecommerce/
├── server/
│   ├── index.js              # Express server entry point
│   ├── database/
│   │   └── db.js            # Database setup and initialization
│   ├── routes/
│   │   ├── products.js      # Product API routes
│   │   ├── cart.js          # Shopping cart API routes
│   │   ├── orders.js        # Order management API routes
│   │   ├── payment.js       # Stripe payment API routes (optional)
│   │   ├── admin.js         # Admin API routes
│   │   ├── categories.js    # Category API routes
│   │   ├── newsletter.js    # Newsletter subscription API
│   │   └── contact.js       # Contact form API
│   └── utils/
│       └── emailService.js  # Email service for notifications
├── client/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── CheckoutSuccess.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── HowToOrder.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   ├── AdminCustomers.jsx
│   │   │   ├── AdminRevenue.jsx
│   │   │   └── AdminCategories.jsx
│   │   ├── config/
│   │   │   └── api.js        # API configuration (WhatsApp number, etc.)
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # React entry point
│   └── package.json
├── package.json             # Root package.json
├── ecosystem.config.js      # PM2 configuration
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose configuration
├── vercel.json              # Vercel deployment configuration
└── DEPLOY_STEPS.md          # Deployment guide

```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Step 1: Install Dependencies

Install root dependencies:
```bash
npm install
```

Install client dependencies:
```bash
cd client
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

### Step 2: Environment Setup

Create a `.env` file in the root directory:

```bash
nano .env
```

Add the following environment variables:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# WhatsApp Number (for ordering)
VITE_WHATSAPP_NUMBER=923008522576

# Admin Password (optional, defaults to 'admin123')
ADMIN_PASSWORD=admin123

# Email Configuration (optional, for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CONTACT_EMAIL=Furorsport1@gmail.com

# Stripe Configuration (optional, only if using Stripe payments)
# STRIPE_SECRET_KEY=sk_test_your_secret_key_here
# STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Note**: The application uses WhatsApp ordering by default. Stripe is optional and can be configured if needed.

### Step 3: Run the Application

#### Development Mode (Recommended)
Run both server and client concurrently:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

#### Run Separately

Backend only:
```bash
npm run server
```

Frontend only:
```bash
npm run client
```

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/meta/categories` - Get all categories

### Cart
- `GET /api/cart/:sessionId` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove` - Remove item from cart
- `DELETE /api/cart/clear/:sessionId` - Clear cart

### Orders
- `POST /api/orders/create` - Create new order
- `POST /api/orders/whatsapp` - Create WhatsApp order
- `GET /api/orders/:orderNumber` - Get order by order number

### Admin
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/products` - Get all products
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/revenue` - Get revenue analytics
- `PUT /api/admin/orders/:id/status` - Update order status
- `DELETE /api/admin/orders/:id` - Delete order

### Payment (Stripe - Optional)
- `POST /api/payment/create-checkout-session` - Create Stripe checkout session
- `POST /api/payment/verify-payment` - Verify payment and create order
- `POST /api/payment/webhook` - Stripe webhook endpoint (optional)

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

### Contact
- `POST /api/contact/submit` - Submit contact form

## Database

The application uses SQLite for data storage. The database file (`ecommerce.db`) will be automatically created in `server/database/` on first run.

### Database Schema

- **products**: Product catalog with images, variants, and sale prices
- **product_images**: Multiple images per product
- **product_variants**: Size and color variants for products
- **cart**: Shopping cart items
- **orders**: Customer orders with WhatsApp integration
- **order_items**: Order line items with variants
- **newsletter**: Newsletter subscribers
- **contact_messages**: Contact form submissions
- **admin**: Admin authentication

## Production Build

Build the frontend for production:
```bash
npm run build
```

The built files will be in `client/dist/`. The Express server will serve these files in production mode.

Start production server:
```bash
NODE_ENV=production npm start
```

## Features in Detail

### Shopping Cart
- Session-based cart (stored in localStorage)
- Add/remove items
- Update quantities
- Persistent across page refreshes

### Product Management
- Category filtering
- Search functionality
- Product details with multiple images (carousel)
- Product variants (size and color selection)
- Sale price display with badges
- Stock management
- Low stock alerts

### Order Processing
- WhatsApp-based ordering system
- Order creation with unique order numbers
- Customer information collection
- Formatted WhatsApp messages with product details and images
- Order confirmation via WhatsApp
- Cart clearing after order placement
- Admin order management and status updates

## Ordering System

This website uses **WhatsApp** for order processing, making it ideal for businesses in regions where payment gateways are limited.

### How It Works:
1. Customer adds products to cart
2. Proceeds to checkout and fills in customer information
3. Order details are formatted and sent via WhatsApp
4. Customer receives WhatsApp message with order summary
5. Admin receives notification in admin panel
6. Admin can manage orders and update status

### WhatsApp Configuration:
- Default number: `+92 300 8522576`
- Configured in `client/src/config/api.js`
- Can be changed via environment variable `VITE_WHATSAPP_NUMBER`

### Stripe Integration (Optional):
Stripe payment integration is available but optional. See `STRIPE_SETUP.md` for configuration if you want to enable direct payments.

## Admin Panel

Access the admin panel at `/admin/login` (default password: `admin123`)

### Admin Features:
- **Dashboard**: Overview with statistics, recent orders, and quick actions
- **Products**: Add, edit, delete products with multiple images and variants
- **Orders**: View all orders, update status, export shipping labels, delete orders
- **Customers**: View customer details and order history
- **Revenue**: Track revenue with period and month/year filters
- **Categories**: Manage product categories

### Admin Routes:
- `/admin/login` - Admin login
- `/admin/dashboard` - Main dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/customers` - Customer management
- `/admin/revenue` - Revenue analytics

### Styling
All styles are in CSS files within each component/page directory. The design follows a modern, clean aesthetic for Furor Sport.

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use, you can:
- Change the port in `.env` file (backend)
- Change the port in `client/vite.config.js` (frontend)

### Database Issues
If you encounter database errors:
- Delete `server/database/ecommerce.db` and restart the server
- The database will be recreated with fresh seed data

### CORS Issues
CORS is enabled for development. For production, configure CORS settings in `server/index.js` to match your domain.

## License

This project is created for Furor Sport.

## Deployment

The application is production-ready! See deployment guides:
- `DEPLOY_STEPS.md` - Step-by-step deployment guide
- `DEPLOYMENT_READINESS_REPORT.md` - Deployment readiness checklist
- `DEPLOYMENT.md` - Detailed deployment instructions
- `VERCEL_DEPLOYMENT.md` - Vercel + Railway deployment

### Quick Deploy:
1. Build: `npm run build:prod`
2. Set environment variables
3. Deploy using PM2, Docker, or cloud platforms (Vercel + Railway)

## Support

For issues or questions, please contact:
- Email: Furorsport1@gmail.com
- WhatsApp: +92 300 8522576
- Instagram: [@furorsport_](https://www.instagram.com/furorsport_?igsh=cW9qYWJwNDloMTAy)

