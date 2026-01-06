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
      // Populate user details to show name in the admin dashboard
      const orders = await Order.find({})
        .populate("userId", "name email")
        .sort({ createdAt: -1 });
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 2. Update Order Status
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

      // 1. Validate Input
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
        });
      }

      // 2. Find Order
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // 3. Update Status
      order.status = status;

      // 4. Handle "Succeeded" (Final Delivery)
      if (status === "Succeeded") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.isPaid = true; // Safety check: if delivered, it's usually paid
      }
      
      // 5. Handle "Cancelled" 
      if (status === "Cancelled") {
        // Optional: If you track inventory, you could increment product stock back here
        order.isDelivered = false; 
      }

      // 6. Save and return populated data
      const updatedOrder = await order.save();
      
      // We populate userId again so the admin panel doesn't lose the customer name in the UI
      const finalOrder = await updatedOrder.populate("userId", "name email");

      res.status(200).json(finalOrder);

    } catch (error) {
      console.error("Status Update Error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server failed to update order status", 
        error: error.message 
      });
    }
  },
};