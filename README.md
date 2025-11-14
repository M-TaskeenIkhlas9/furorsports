# Furor Sport Ecommerce Website

A full-stack ecommerce website for Furor Sport, featuring professional sports wear, fitness wear, and street wear products.

## Features

- **Product Catalog**: Browse products by category (Sports Uniforms, Fitness Wears, Street Wears, Martial Arts/Karate Uniforms)
- **Shopping Cart**: Add products to cart, update quantities, and manage items
- **Stripe Payment Integration**: Secure payment processing with Stripe Checkout
- **Checkout**: Complete order placement with customer information and payment
- **Product Details**: Detailed product pages with descriptions and pricing
- **Newsletter Subscription**: Subscribe to newsletter updates
- **Contact Form**: Send messages to the company
- **Responsive Design**: Mobile-friendly interface
- **Order Management**: Track orders with unique order numbers

## Technology Stack

### Backend
- Node.js
- Express.js
- SQLite (database)
- Stripe (payment processing)
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
│   └── routes/
│       ├── products.js      # Product API routes
│       ├── cart.js          # Shopping cart API routes
│       ├── orders.js        # Order management API routes
│       ├── payment.js        # Stripe payment API routes
│       ├── newsletter.js     # Newsletter subscription API
│       └── contact.js        # Contact form API
├── client/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── HowToOrder.jsx
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # React entry point
│   └── package.json
└── package.json             # Root package.json

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

Create a `.env` file in the root directory. Copy from `.env.example`:

```bash
cp .env.example .env
```

Then edit `.env` and add your Stripe API keys:
```
PORT=5000
NODE_ENV=development

# Stripe Configuration (Required for payments)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLIENT_URL=http://localhost:3000
```

**Important**: Get your Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys). See `STRIPE_SETUP.md` for detailed instructions.

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
- `GET /api/orders/:orderNumber` - Get order by order number

### Payment (Stripe)
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

- **products**: Product catalog
- **cart**: Shopping cart items
- **orders**: Customer orders
- **order_items**: Order line items
- **newsletter**: Newsletter subscribers
- **contact_messages**: Contact form submissions

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
- Product details with images
- Stock management

### Order Processing
- Order creation with unique order numbers
- Customer information collection
- Order confirmation
- Cart clearing after order placement

## Payment Integration

This website uses **Stripe** for secure payment processing. 

### Quick Setup:
1. Sign up at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add them to your `.env` file
4. See `STRIPE_SETUP.md` for detailed instructions

### Test Cards:
- Use `4242 4242 4242 4242` for successful test payments
- Any future expiry date and 3-digit CVC
- See `STRIPE_SETUP.md` for more test cards

## Customization

### Adding Products
Products are seeded automatically on first run. To add more products, you can:
1. Insert directly into the database
2. Create an admin panel (future enhancement)
3. Modify the seed data in `server/database/db.js`

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

## Support

For issues or questions, please contact:
- Email: Furorsport1@gmail.com
- WhatsApp: +92-330-8317171

