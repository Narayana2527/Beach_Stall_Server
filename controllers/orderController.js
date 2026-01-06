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
      const validStatuses = [
        "Pending", 
        "Order Preparing", 
        "Order Ready", 
        "Out for Delivery", 
        "Succeeded", 
        "Cancelled"
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status update" });
      }

      const order = await Order.findById(req.params.id);

      if (order) {
        order.status = status;
        // If status is Succeeded, we can mark as delivered
        if (status === "Succeeded") {
          order.isDelivered = true;
          order.deliveredAt = Date.now();
        }
        
        const updatedOrder = await order.save();
        res.json(updatedOrder);
      } else {
        res.status(404).json({ message: "Order not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};