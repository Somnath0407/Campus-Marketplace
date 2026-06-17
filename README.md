# Campus Marketplace

A full-stack web application that lets students within the same college buy and sell items (books, electronics, and more) — scoped by college so listings stay relevant.

## Features

- JWT-based authentication (register / login)
- College-scoped listings — you only see products from your college
- Post, edit and delete listings with image upload
- Wishlist / save items
- In-app messaging between buyers and sellers
- Dark mode support

## Project Structure

```
campus-marketplace/
├── backend/          # Node.js + Express REST API
│   ├── config/       # MongoDB connection
│   ├── middleware/   # JWT auth middleware
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── uploads/      # Local image storage
│   └── utils/        # Multer upload config
└── frontend/         # React + Vite SPA
    └── src/
        ├── api/      # Axios instance
        ├── components/
        ├── context/  # Auth and Wishlist context
        └── pages/
```

## Local Development

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account (or local MongoDB)

### 1. Backend

```bash
cd backend
cp .env.example .env       # Fill in your values
npm install
npm run dev                # Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                # Runs on http://localhost:5173
```

## Environment Variables

### `backend/.env`

| Variable     | Description                                               |
|--------------|-----------------------------------------------------------|
| `PORT`       | Server port (default: 5000)                               |
| `MONGO_URI`  | MongoDB Atlas connection string                           |
| `JWT_SECRET` | Strong random secret for JWT signing                      |
| `CLIENT_URL` | Frontend URL for CORS (e.g. https://your-app.vercel.app) |

> **Never commit `.env` to git.** Use `.env.example` as a reference template.

## Deployment

See the deployment guide below for step-by-step instructions to deploy on Render (backend) and Vercel (frontend).

## License

This project is licensed under the [MIT License](./LICENSE).
