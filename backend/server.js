
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

// Allowed frontend origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://campus-marketplace-dun.vercel.app'
];

if (process.env.CLIENT_URL) {
    const normalized = process.env.CLIENT_URL.replace(/\/+$/, '');

    if (!allowedOrigins.includes(normalized)) {
        allowedOrigins.push(normalized);
    }
}

// CORS Configuration
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log('Blocked CORS origin:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
    res.json({
        message: 'Campus Marketplace API is running'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        message: 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
