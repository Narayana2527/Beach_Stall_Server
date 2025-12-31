// models/orderModel.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true, default: "COD" },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, default: false },
  status: { 
    type: String, 
    required: true, 
    default: "Pending",
    enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]
  },
  paidAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);