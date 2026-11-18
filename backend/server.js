try {
  require('node:dns/promises').setServers(['1.1.1.1', '8.8.8.8']);
} catch (dnsErr) {
  console.warn('DNS setServers warning:', dnsErr.message);
}
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://campus-marketplace-dun.vercel.app',
];

if (process.env.CLIENT_URL) {
  const normalized = process.env.CLIENT_URL.replace(/\/+$/, '');
  if (!allowedOrigins.includes(normalized)) {
    allowedOrigins.push(normalized);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, health checks)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/campus-marketplace.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Campus Marketplace API is running 🚀' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
