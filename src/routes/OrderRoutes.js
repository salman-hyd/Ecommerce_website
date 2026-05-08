const express = require('express');
const router = express.Router();

const { Cart, Product, Order, OrderItem, User } = require('../models');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require("../middleware/adminMiddleware");

const { Op } = require("sequelize");


// 🛒 CREATE ORDER
// 🛒 CREATE ORDER
router.post('/', authMiddleware, async (req, res) => {
  try {

    // GET USER CART
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'Product' }]
    });

    // EMPTY CART
    if (cartItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    let totalAmount = 0;

    // ✅ VALIDATE STOCK + CALCULATE TOTAL
    for (let item of cartItems) {

      const product = item.Product;

      if (!product) {
        return res.status(400).json({
          message: "Product not found"
        });
      }

      // STOCK CHECK
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`
        });
      }

      // TOTAL
      totalAmount += item.quantity * product.price;
    }

    // ✅ CREATE ORDER
    const order = await Order.create({
      userId: req.user.id,
      totalAmount: Number(totalAmount),
      status: "pending"
    });

    // ✅ CREATE ORDER ITEMS + REDUCE STOCK
    for (let item of cartItems) {

      const product = item.Product;

      // REDUCE STOCK
      product.stock -= item.quantity;

      await product.save();

      // CREATE ORDER ITEM
      await OrderItem.create({
        orderId: order.id,
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // ✅ CLEAR CART
    await Cart.destroy({
      where: { userId: req.user.id }
    });

    res.json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {

    console.error("ORDER ERROR:", error);

    res.status(500).json({
      error: error.message
    });
  }
});


// 👤 USER: GET OWN ORDERS
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,   // ✅ FIX: include user
          attributes: ["id", "name", "email"]
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🧑‍💼 ADMIN: GET ALL ORDERS
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"]
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["name", "price"]
            }
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(orders);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});


// 📉 LOW STOCK
router.get('/low-stock', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        stock: { [Op.lt]: 5 }
      }
    });

    res.json(products);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔄 UPDATE ORDER STATUS
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Status updated", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;