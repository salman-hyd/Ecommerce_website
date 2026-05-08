const express = require('express');
const router = express.Router();

const Cart = require('../models/Cart');
const Product = require('../models/product');
const authMiddleware = require('../middleware/authMiddleware');


// 👉 Add to cart
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Not enough stock available"
      });
    }

    const existingItem = await Cart.findOne({
      where: {
        userId: req.user.id,
        productId
      }
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;

      if (newQty > product.stock) {
        return res.status(400).json({
          message: "Exceeds available stock"
        });
      }

      existingItem.quantity = newQty;
      await existingItem.save();

      return res.json({
        message: "Cart updated",
        cartItem: existingItem
      });
    }

    const cartItem = await Cart.create({
      userId: req.user.id,
      productId,
      quantity
    });

    res.json({
      message: "Product added to cart",
      cartItem
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// 👉 View cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          as: 'Product'   // ✅ USE LOWERCASE CONSISTENTLY
        }
      ]
    });

    res.json({
      message: "Cart fetched",
      cartItems
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// 👉 Update quantity
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cartItem = await Cart.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const product = await Product.findByPk(cartItem.productId);

    if (quantity > product.stock) {
      return res.status(400).json({
        message: "Exceeds available stock"
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      message: "Cart updated",
      cartItem
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// 👉 Delete item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const cartItem = await Cart.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cartItem.destroy();

    res.json({
      message: "Item removed from cart"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;