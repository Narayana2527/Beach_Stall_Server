const Cart = require("../model/cartModel");

module.exports = {
  addToCart: async (req, res) => {
    const { productId, name, price, image, quantity } = req.body;
    const userId = req.user._id; // Extract _id from the full user object

    try {
      let cart = await Cart.findOne({ userId });
      const amount = Number(quantity) || 1;

      if (cart) {
        const itemIndex = cart.items.findIndex(p => p.productId === productId);
        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += amount;
          if (cart.items[itemIndex].quantity <= 0) cart.items.splice(itemIndex, 1);
        } else if (amount > 0) {
          cart.items.push({ productId, name, price, image, quantity: amount });
        }
        await cart.save();
      } else {
        cart = await Cart.create({
          userId,
          items: [{ productId, name, price, image, quantity: Math.max(1, amount) }]
        });
      }
      res.status(200).json(cart);
    } catch (error) {
      console.error("Cart update error:", error);
      res.status(500).json({ message: "Cart update failed", error: error.message });
    }
  },

  getCart: async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.user._id });
      res.status(200).json(cart || { items: [] });
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart", error: error.message });
    }
  },

  removeFromCart: async (req, res) => {
    const { productId } = req.params;
    try {
      const cart = await Cart.findOne({ userId: req.user._id });
      if (cart) {
        cart.items = cart.items.filter((item) => item.productId !== productId);
        await cart.save();
      }
      res.status(200).json(cart || { items: [] });
    } catch (error) {
      res.status(500).json({ message: "Error removing item", error: error.message });
    }
  }
};