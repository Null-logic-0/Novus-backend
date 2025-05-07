# 🛠️ Novus Backend – Scalable Real-Time API Server

This is the backend for **Novus**, a full-stack, real-time social media platform. The backend is designed with security, scalability, and modularity in mind, powering features like JWT authentication, media uploads, real-time messaging, and email delivery.

## 🧠 Tech Stack

### Core Framework & Logic
- **Node.js + Express.js** – Fast and lightweight REST API server
- **MongoDB + Mongoose** – Flexible NoSQL database with schema-based models
- **JWT** – Secure token-based authentication and authorization
- **Socket.IO** – Real-time communication via WebSockets
- **AWS S3** – Scalable cloud storage for media uploads

### Email System
- **Nodemailer** – Email delivery service for transactional emails
- **Pug Templates** – Rich, styled HTML email templates
- **Resend.js** – Modern email API for additional delivery layer

## 🔐 Key Features

- 🔑 Secure JWT-based authentication and protected routes
- 🧾 Email verification and password reset functionality
- 💬 Real-time messaging with Socket.IO
- 🖼️ Media upload and storage via AWS S3
- 📩 Transactional emails with styled Pug templates
- 🧩 Modular, clean architecture with separation of concerns
- 🌍 CORS and environment-based configuration support

## 🌲 Folder Structure

    src/
    ├── config/ # DB connection, AWS, email settings
    ├── controllers/ # Route handlers (auth, user, chat, etc.)
    ├── middleware/ # Auth checks, error handling, validators
    ├── models/ # Mongoose schemas (User, Message, etc.)
    ├── routes/ # Modular API routes
    ├── services/ # Business logic (email, s3, etc.)
    ├── sockets/ # WebSocket event handlers
    ├── templates/ # Pug email templates
    └── utils/ # Utility functions


    
## 🚀 Getting Started

### Clone the repository
```bash
git clone https://github.com/Null-logic-0/Novus-backend
cd Novus-backend

npm install

Setup environment variables
Create a .env file in the root with the following:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=your_s3_bucket
EMAIL_FROM=no-reply@yourdomain.com
RESEND_API_KEY=your_resend_key
CLIENT_URL=http://localhost:5173

npm run dev



