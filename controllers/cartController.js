const Cart = require("../model/cartModel");

module.exports = {
  // Add item to cart (Handles both initial add and +/- increments)
  addToCart: async (req, res) => {
    const { productId, name, price, image, quantity } = req.body;
    const userId = req.user; // Ensure your 'protect' middleware sets req.user

    try {
      let cart = await Cart.findOne({ userId });
      // Determine how many to add. Default to 1 if not specified.
      const amountChange = quantity !== undefined ? Number(quantity) : 1;

      if (cart) {
        const itemIndex = cart.items.findIndex((p) => p.productId === productId);

        if (itemIndex > -1) {
          // UPDATE EXISTING ITEM
          cart.items[itemIndex].quantity += amountChange;

          // If quantity becomes 0 or less, remove the item entirely
          if (cart.items[itemIndex].quantity <= 0) {
            cart.items.splice(itemIndex, 1);
          }
        } else {
          // ADD NEW ITEM (Only if amountChange is positive)
          if (amountChange > 0) {
            cart.items.push({ 
              productId, 
              name, 
              price, 
              image, 
              quantity: amountChange 
            });
          }
        }
        await cart.save();
        return res.status(200).json(cart);
      } else {
        // CREATE NEW CART
        if (amountChange <= 0) {
          return res.status(200).json({ items: [] });
        }
        const newCart = await Cart.create({
          userId,
          items: [{ productId, name, price, image, quantity: amountChange }]
        });
        return res.status(201).json(newCart);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Error updating cart", error: error.message });
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