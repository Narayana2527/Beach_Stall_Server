const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Import Routes
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize DB
connectDB();

// 🟢 1. CORS Configuration (Must be at the top)
// When using credentials (cookies), origin cannot be "*"
app.use(cors({
    origin: [
        "https://beachstall.netlify.app", 
        "http://localhost:5173",
    ],
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

// 🟢 2. Security & Parsing Middleware
app.use(cookieParser()); // Required to parse the JWT from cookies
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🟢 3. Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🟢 4. API Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/product", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", bookingRoutes);
app.use("/api", contactRoutes);

// Health Check
app.get('/', (req, res) => {
    res.status(200).json({ message: "Restaurant API is live and secure!" });
});

// 🟢 5. Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}