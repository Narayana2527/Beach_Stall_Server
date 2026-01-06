const Order = require("../model/orderModel");
const Cart = require("../model/cartModel"); // IMPORT THIS

module.exports = {
  createOrder: async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      userId: req.user, // Ensure req.user is the ID from your protect middleware
      orderItems: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        productId: item.productId // Ensure this matches your frontend key
      })),
      shippingAddress,
      totalPrice,
      paymentMethod,
      isPaid: true,
      paidAt: Date.now(),
    });

    const createdOrder = await order.save();
    await Cart.findOneAndDelete({ userId: req.user });

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  },

    getMyOrders: async (req, res) => {
    try {
      
      const orders = await Order.find({ userId: req.user })
        .populate({
          path:'orderItems.productId',
          model:"Product"
        }) 
        .sort({ createdAt: -1 });
        
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find({})
        .populate("userId", "name email")
        .sort({ createdAt: -1 });
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;

      const validStatuses = [
        "Pending", 
        "Order Preparing", 
        "Order Ready", 
        "Out for Delivery", 
        "Succeeded", 
        "Cancelled"
      ];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
        });
      }

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // Update the status
      order.status = status;

      // Handle Delivery Logic
      if (status === "Succeeded") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.isPaid = true; 
      }
      
      if (status === "Cancelled") {
        order.isDelivered = false; 
      }

      const updatedOrder = await order.save();
      
      // 🟢 CRITICAL: Re-populate userId so the Admin UI still shows the name
      const finalOrder = await Order.findById(updatedOrder._id).populate("userId", "name email");

      res.status(200).json(finalOrder);

    } catch (error) {
      console.error("Status Update Error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server failed to update status", 
        error: error.message 
      });
    }
  },
  cancelOrder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // 🟢 Security: req.user is an object from 'protect' middleware. Use ._id
      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: "Not authorized to cancel this order" });
      }

      // 🟢 Business Logic: Don't allow cancellation if food is already out or delivered
      const nonCancellable = ["Out for Delivery", "Succeeded", "Cancelled"];
      if (nonCancellable.includes(order.status)) {
        return res.status(400).json({ 
          success: false, 
          message: `Cancellation blocked: Order is already ${order.status}` 
        });
      }

      order.status = "Cancelled";
      const updatedOrder = await order.save();

      res.status(200).json({
        success: true,
        message: "Order has been cancelled",
        order: updatedOrder
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};