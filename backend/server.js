const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS — allow the deployed frontend URL in production, localhost in development
const allowedOrigins = [
  process.env.FRONTEND_URL,          // Render frontend URL (set in Render dashboard)
  'http://localhost:5173',            // Vite dev server
  'http://localhost:4173',            // Vite preview
].filter(Boolean);                    // remove undefined if FRONTEND_URL not set yet

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

const aiRoutes = require('./src/routes/aiRoutes')

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/transactions', require('./src/routes/transactionRoutes'));
app.use('/api/ai', aiRoutes);
app.use('/api/reports', require('./src/routes/reportRoutes'));

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
