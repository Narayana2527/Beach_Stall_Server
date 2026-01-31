const Cart = require("../model/cartModel");

module.exports = {
  // Add item to cart (Handles both initial add and +/- increments)
  addToCart: async (req, res) => {
    const { productId, name, price, image, quantity } = req.body;
    const userId = req.user; // Set by protect middleware

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
          items: [{ productId, name, price, image, quantity: amount }]
        });
      }
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: "Cart update failed" });
    }
  },

  // Get cart for specific user
  getCart: async (req, res) => {
    try {
      // Find cart and ensure it returns an empty items array if no cart exists
      const cart = await Cart.findOne({ userId: req.user });
      res.status(200).json(cart || { items: [] });
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart", error: error.message });
    }
  },

  // Remove specific item (Trash icon click)
  removeFromCart: async (req, res) => {
    const { productId } = req.params;
    try {
      const cart = await Cart.findOne({ userId: req.user });
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