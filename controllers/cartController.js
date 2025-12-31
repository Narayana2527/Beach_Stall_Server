const Cart = require("../model/cartModel");

module.exports = {
  // Add item to cart (or update quantity if exists)
  addToCart: async (req, res) => {
    const { productId, name, price, image, quantity } = req.body;
    const userId = req.user; // From protect middleware

    try {
      let cart = await Cart.findOne({ userId });

      if (cart) {
        const itemIndex = cart.items.findIndex((p) => p.productId === productId);
        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += quantity || 1;
        } else {
          cart.items.push({ productId, name, price, image, quantity });
        }
        cart = await cart.save();
        return res.status(200).json(cart);
      } else {
        const newCart = await Cart.create({
          userId,
          items: [{ productId, name, price, image, quantity }]
        });
        return res.status(201).json(newCart);
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating cart", error });
    }
  },

  // Get cart for specific user
  getCart: async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.user });
      res.status(200).json(cart || { items: [] });
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart", error });
    }
  },

  // Remove specific item
  removeFromCart: async (req, res) => {
    const { productId } = req.params;
    try {
      const cart = await Cart.findOne({ userId: req.user });
      if (cart) {
        cart.items = cart.items.filter((item) => item.productId !== productId);
        await cart.save();
      }
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: "Error removing item", error });
    }
  }
};