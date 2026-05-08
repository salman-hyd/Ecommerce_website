const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  User,
  Product,
  Order
} = require("../models");

// 📊 ADMIN DASHBOARD STATS
router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {

      // TOTAL USERS
      const totalUsers = await User.count();

      // TOTAL PRODUCTS
      const totalProducts = await Product.count();

      // TOTAL ORDERS
      const totalOrders = await Order.count();

      // TOTAL REVENUE
      const revenue = await Order.sum("totalAmount");

      res.json({
        totalUsers,
        totalProducts,
        totalOrders,
        revenue: revenue || 0
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        error: err.message
      });
    }
  }
);

module.exports = router;