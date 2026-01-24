const express = require("express");
const cors = require("cors");
const path = require("path");
// body-parser is now built into express, you can simplify this
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import Routes
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
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

// 🟢 Middleware Configuration
// Use express.json() with a limit to handle larger payloads if necessary
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
    origin: "*", // For production, replace with your actual frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🟢 static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🟢 Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/product", productRoutes);
app.use("/api/orders", orderRoutes); // This handles your status updates
app.use("/api", bookingRoutes);
app.use("/api", contactRoutes);
app.use("/api/notifications", notificationRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: "Restaurant API is live!" });
});

// 🟢 Global Error Handler (Highly recommended for Vercel)
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