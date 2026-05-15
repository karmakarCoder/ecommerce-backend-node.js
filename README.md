# E-Commerce Backend API v3

A robust Node.js backend for e-commerce, featuring Stripe integration, automated email notifications via Brevo, and comprehensive admin controls.

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JSON Web Tokens (JWT)
- **Payments:** Stripe
- **Email:** Nodemailer & Brevo
- **File Uploads:** Multer

## ✨ Key Features

### 🔐 User Features
- **Identity:** Secure Signup, Login, and Profile management.
- **Commerce:** Browse products and view detailed product information.
- **Cart:** Add to cart, view cart list, and remove items.
- **Checkout:** Secure payment processing via Stripe.

### 🛡 Admin Features
- **Catalog:** Full CRUD (Create, Read, Update, Delete) for products.
- **User Management:** List users, edit profiles, and ban users.
- **Notifications:** Automated email alerts to users when banned (Brevo).
- **Orders:** Centralized list of all customer orders.

- Postman collection https://drive.google.com/file/d/173eeEpbqhX1RVbAfrZuxWTFmNrmxSnQC/view?usp=sharing

## 🚀 Installation
1. Clone the repo: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Configure `.env`:
   - `MONGO_URI`, `JWT_SECRET`, `STRIPE_KEY`, `BREVO_KEY`
4. Start the server: `npm start`
