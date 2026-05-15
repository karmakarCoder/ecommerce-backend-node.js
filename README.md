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

### 👤 User Experience
*   **Identity & Security:** Secure signup/login with profile management and real-time updates.
*   **Seamless Commerce:** Browse a dynamic product catalog with detailed views.
*   **Advanced Cart System:** Add, remove, and manage items with persistent state.
*   **Interactive Reviews:** Share feedback on products with a built-in rating and review system.
*   **Secure Checkout:** Integrated with **Stripe**.
    *   **Real-time Updates:** Utilizes **Stripe Webhooks** to provide instant payment status confirmation (Pending/Success/Failed) without page refreshes.

### 🛡 Admin Dashboard
*   **Product Catalog (CRUD):** Full control over the inventory—create, edit, and delete products.
*   **User Management:** 
    *   Comprehensive user listing and profile inspection.
    *   Ability to **ban/unban** users with automated email alerts via **Brevo**.
*   **Order Intelligence:**
    *   Centralized order tracking.
    *   **Order Status Management:** Update shipping/processing status with automated email notifications to the customer.
*   **Feedback Management:**
    *   Reply to user reviews directly from the dashboard.
    *   Automated email notifications to users when an admin responds to their review.

- Postman collection https://drive.google.com/file/d/173eeEpbqhX1RVbAfrZuxWTFmNrmxSnQC/view?usp=sharing

## 🚀 Installation
1. Clone the repo: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Configure `.env`:
   - `MONGO_URI`, `JWT_SECRET`, `STRIPE_KEY`, `BREVO_KEY`
4. Start the server: `npm start`
