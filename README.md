# Ecommerce
<img width="1900" height="962" alt="Screenshot 2026-07-26 201228" src="https://github.com/user-attachments/assets/0d4ae1b5-3da1-45fc-9580-44f98d45458b" />

# Ecommerce.AI Setup Guide

This project contains three parts:
- Frontend store: `ecommerce`
- Admin panel: `admin`
- Backend API: `backend`

## Requirements
- Node.js 18+
- MongoDB running locally on `mongodb://localhost:27017/local-shop`

## 1. Install dependencies
Run these commands from the project root:

```bash
cd backend && npm install
cd ../ecommerce && npm install
cd ../admin && npm install
```

## 2. Configure environment (recommended)
Create a file named `.env` inside the `backend` folder with:

```env
MongoURI=mongodb://localhost:27017/local-shop
JWT_SECRET=change_this_secret
SHOP_EMAIL=orders@local-shop.test
```

## 3. Start the services
Open three terminals.

### Terminal 1 - Backend
```bash
cd backend
node index.js
```
The backend will run at:
- http://localhost:4000

### Terminal 2 - Storefront
```bash
cd ecommerce
npm start
```
The storefront will run at:
- http://localhost:3000

### Terminal 3 - Admin panel
```bash
cd admin
npm run dev
```
The admin panel will run at:
- http://localhost:5173

## 4. Add products from the admin panel
1. Open http://localhost:5173
2. Go to the Add Product section
3. Fill in the product details:
   - Product Title
   - Category
   - Price
   - Description
   - Stock
4. Upload an image
5. Click Add Product

The new product will be saved in the database and should appear in the storefront after refresh.

## 5. Shop and checkout
1. Open http://localhost:3000
2. Sign up or log in
3. Browse products and click the `+` button to add items to cart
4. Open the cart and click Checkout
5. Fill in your shipping details
6. Choose a payment method
7. Submit the order

Checkout uses the backend order flow and confirms the order after a mock payment step.

## Troubleshooting
- If the storefront cannot load products, make sure the backend is running.
- If admin product upload fails, verify MongoDB is running and the backend is reachable on port 4000.
- If you see a login issue, make sure you created an account first.
