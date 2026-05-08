const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  Wishlist,
  Product,
} = require("../models");


/* =========================
   ADD TO WISHLIST
========================= */

router.post("/", authMiddleware, async (req, res) => {
  try {

    const { productId } = req.body;

    const existing = await Wishlist.findOne({
      where: {
        userId: req.user.id,
        productId,
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Already in wishlist",
      });
    }

    const item = await Wishlist.create({
      userId: req.user.id,
      productId,
    });

    res.json({
      message: "Added to wishlist",
      item,
    });

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }
});


/* =========================
   GET WISHLIST
========================= */

router.get("/", authMiddleware, async (req, res) => {
  try {

    const items = await Wishlist.findAll({
      where: {
        userId: req.user.id,
      },

      include: [
        {
          model: Product,
          as: "Product",
        },
      ],
    });

    res.json(items);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }
});


/* =========================
   REMOVE FROM WISHLIST
========================= */

router.delete("/:id", authMiddleware, async (req, res) => {
  try {

    await Wishlist.destroy({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    res.json({
      message: "Removed from wishlist",
    });

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }
});

module.exports = router;