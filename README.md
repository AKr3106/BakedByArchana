# BakedByArchana 🍰

BakedByArchana is a full-stack, end-to-end e-commerce web application built for a custom bakery. The application enables users to browse a menu of delicious cakes, customize their orders, manage a cart, checkout using secure payment gateways, track order statuses in real-time, and request cancellations. It also features a robust, secure administrator dashboard for managing all platform orders.

---

## 🚀 Features

### **For Customers:**
*   🔐 **User Authentication**: Secure sign-up and sign-in functionality with persistent user sessions.
*   🍰 **Interactive Menu**: Explore a grid of beautiful cake designs with descriptions, price information, and "Read More" expandability.
*   🛒 **Slide-Out Cart Drawer**: Add cakes, update quantities, and view order subtotals on the fly.
*   💳 **Secure Checkout**:
    *   Interactive multi-step shipping address setup.
    *   Seamless online payment gateway integration via **Razorpay**.
    *   Cash on Delivery (COD) backup option.
*   📦 **Real-time Order History**: Track order progression from your profile page with detailed statuses (`Processing`, `Baking`, `Out for Delivery`, `Delivered`, `Cancelled`).
*   ⚠️ **Cancellation Requests**: Submit order cancellation requests with a custom reason directly from the order history panel.

### **For Administrators:**
*   📊 **Comprehensive Order Dashboard**: View all historical and active customer orders across the platform.
*   📈 **Order Lifecycle Control**: Update order statuses instantly (e.g., transitioning an order from `Processing` ➔ `Baking` ➔ `Out for Delivery` ➔ `Delivered` via dropdowns).
*   🔍 **Status Filtering**: Filter orders instantly by their status pills.
*   🚨 **Cancellation Management**: A dedicated tab displaying pending cancellation requests. Admins can review user reasons and "Accept & Cancel" or "Reject" them with one click.

---

## 🛠️ Technology Stack

### **Frontend**
*   **React** (built with Vite)
*   **Framer Motion** (for smooth micro-interactions, layout transitions, and modals)
*   **Lucide React** (icons library)
*   **Vanilla CSS** (tailored warm bakery theme palette)

### **Backend**
*   **Node.js** & **Express**
*   **MongoDB** & **Mongoose** (Order, User, and Cake schemas)
*   **Razorpay SDK** (for payment processing and verification signatures)

---

## ⚙️ Project Setup

### **Prerequisites**
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed and running locally.

### **Backend Configuration**
1. Navigate to the `backend/` directory.
2. Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```
3. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

### **Frontend Configuration**
1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web app locally at `http://localhost:5173`.

---

## 📂 Project Structure

```text
BakedByArchana/
├── backend/
│   ├── models/            # Mongoose Schemas (User, Order)
│   ├── middleware/        # Authentication & Role Authorization
│   ├── routes/            # Order and User API endpoints
│   └── server.js          # Entry point
└── frontend/
    ├── src/
    │   ├── components/    # Reusable items (Navbar, CartDrawer, etc.)
    │   ├── context/       # React Contexts (Auth, Cart, Theme)
    │   ├── pages/         # Page Views (Home, Menu, Profile, AdminOrders)
    │   └── App.jsx        # Routing configuration
```
