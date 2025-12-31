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
}
};