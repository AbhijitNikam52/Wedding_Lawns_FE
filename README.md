# 💍 WeddingLawn Booking Platform
> MERN Stack | Real-Time Chat | Booking System | Razorpay Payments

---

## 🚀 Quick Start — Run Locally

### Step 1: Clone / Open the project
```bash
cd weddingLawn
```

### Step 2: Setup Backend
```bash
cd server
npm install
cp .env.example .env
# → Open .env and fill in your MongoDB URI, JWT secret, Cloudinary & Razorpay keys
npm run dev
# Server starts at http://localhost:5000
```

### Step 3: Setup Frontend
```bash
cd ../client
npm install
# .env is already configured for local development
npm run dev
# App opens at http://localhost:5173
```

---

## 🗄️ MongoDB Atlas Setup (One-time)

1. Go to https://cloud.mongodb.com and create a free account
2. Create a new **Cluster** (M0 Free Tier)
3. Click **Connect** → **Drivers** → copy the connection string
4. Replace `<username>` and `<password>` in the string
5. Paste it as `MONGODB_URI` in `server/.env`
6. In **Network Access** → Add IP Address → Allow from anywhere: `0.0.0.0/0`

---

## 📁 Project Structure

```
weddingLawn/
├── server/                    ← Node.js + Express Backend
│   ├── config/
│   │   ├── db.js              ← MongoDB connection
│   │   └── cloudinary.js      ← Cloudinary config
│   ├── controllers/
│   │   ├── authController.js  ← Register, Login, GetMe
│   │   └── lawnController.js  ← (Day 5 placeholder)
│   ├── middleware/
│   │   ├── authMiddleware.js  ← JWT protect + role guard
│   │   └── errorHandler.js    ← Global error handler
│   ├── models/
│   │   ├── User.js            ← User schema
│   │   ├── Lawn.js            ← Lawn schema
│   │   ├── Booking.js         ← Booking schema
│   │   ├── Availability.js    ← Availability schema
│   │   ├── Message.js         ← Chat message schema
│   │   └── Payment.js         ← Payment schema
│   ├── routes/
│   │   ├── authRoutes.js      ← /api/auth/*
│   │   └── lawnRoutes.js      ← /api/lawns/* (Day 5)
│   ├── socket/                ← Socket.io handlers (Day 12)
│   ├── utils/                 ← Email helpers (Day 19)
│   ├── .env                   ← 🔒 Never commit this!
│   ├── .env.example           ← Safe template to commit
│   └── server.js              ← App entry point
│
├── client/                    ← React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── ui/
│   │   │   │   └── Spinner.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   ← Global auth state + JWT
│   │   │   └── SocketContext.jsx ← Global Socket.io connection
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   └── PlaceholderPages.jsx ← replaced day by day
│   │   ├── services/
│   │   │   └── api.js            ← Axios instance with JWT interceptor
│   │   ├── App.jsx               ← All routes defined here
│   │   ├── main.jsx              ← React entry point
│   │   └── index.css             ← Tailwind + custom classes
│   ├── .env                      ← VITE_API_URL etc.
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── .gitignore
```

---

## 🔐 API Endpoints (Day 1 — Auth ready)

| Method | Endpoint            | Auth | Description               |
|--------|---------------------|------|---------------------------|
| POST   | /api/auth/register  | No   | Create user/owner account |
| POST   | /api/auth/login     | No   | Login → returns JWT token |
| GET    | /api/auth/me        | Yes  | Get current logged-in user|
| GET    | /api/lawns          | No   | Placeholder (Day 5)       |

---

## 📅 Sprint Schedule

| Day | Feature                     |
|-----|-----------------------------|
| 1   | ✅ Project Setup (today)    |
| 2   | Auth Backend (JWT)          |
| 3   | Auth Frontend               |
| 4   | Lawn Model                  |
| 5   | Lawn API                    |
| 6   | Lawn UI                     |
| 7   | Photo Upload (Cloudinary)   |
| 8   | Availability Backend        |
| 9   | Availability Frontend       |
| 10  | Booking Backend             |
| 11  | Booking Frontend            |
| 12  | Chat Backend (Socket.io)    |
| 13  | Chat Frontend               |
| 14  | Payment Backend (Razorpay)  |
| 15  | Payment Frontend            |
| ... | ...                         |
| 25  | Deployment                  |

---

## 🧪 Test the API (once server is running)

```bash
# Health check
curl http://localhost:5000/

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"123456","role":"user"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Axios |
| Backend   | Node.js, Express.js, Socket.io      |
| Database  | MongoDB Atlas, Mongoose             |
| Auth      | JWT, bcryptjs                       |
| Files     | Cloudinary, Multer                  |
| Payments  | Razorpay                            |
| Email     | Nodemailer (Gmail SMTP)             |
| Deploy    | Vercel (frontend) + Render (backend)|
