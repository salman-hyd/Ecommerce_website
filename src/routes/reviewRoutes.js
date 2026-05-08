const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  Review,
  User,
  Product
} = require("../models");

/* ADD REVIEW */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const review = await Review.create({
      userId: req.user.id,
      productId,
      rating,
      comment,
    });
      const fullReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "image"],
        },
      ],
    });

    res.json(review);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* GET PRODUCT REVIEWS */
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: {
        productId: req.params.productId,
      },

      include: [
        {
          model: User,
          attributes: ["name", "image"],
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    res.json(reviews);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
