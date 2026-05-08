const express = require("express");
const router = express.Router();

const Product = require("../models/product");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// ✅ CLOUDINARY + MULTER
const multer = require("multer");
const { storage } = require("../config/cloudinary");

const upload = multer({ storage });


// ✅ CREATE PRODUCT
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {

      console.log("BODY:", req.body);
      console.log("FILE:", req.file);

      const { name, price, description, stock } = req.body;

      // ✅ validation
      if (!name || !price || stock === undefined) {
        return res.status(400).json({
          message: "Name, price and stock are required",
        });
      }

      // ✅ duplicate check
      const existing = await Product.findOne({
        where: { name },
      });

      if (existing) {
        return res.status(400).json({
          message: "Product already exists",
        });
      }

      // ✅ cloudinary image url
      const image = req.file ? req.file.path : "";

      // ✅ create product
      const product = await Product.create({
        name,
        price,
        description,
        stock,
        image,
      });

      res.json({
        message: "Product added successfully",
        product,
      });

    } catch (error) {

      console.error("FULL ERROR:", error);

      res.status(500).json({
        error: error.message,
      });
    }
  }
);



// ✅ GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {

    const products = await Product.findAll();

    res.json(products);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });
  }
});


// ✅ RESTOCK PRODUCT
router.put(
  "/restock/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {

      const { stock } = req.body;

      if (!stock || stock <= 0) {
        return res.status(400).json({
          message: "Invalid stock value",
        });
      }

      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      product.stock += Number(stock);

      await product.save();

      res.json({
        message: "Product restocked successfully",
        product,
      });

    } catch (error) {

      res.status(500).json({
        error: error.message,
      });
    }
  }
);


// ✅ UPDATE PRODUCT
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {

      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      const { name, price, description, stock } = req.body;

      // ✅ update fields
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.stock = stock || product.stock;

      // ✅ update image if uploaded
      if (req.file) {
        product.image = req.file.path;
      }

      await product.save();

      res.json({
        message: "Product updated",
        product,
      });

    } catch (error) {

      res.status(500).json({
        error: error.message,
      });
    }
  }
);


// ✅ DELETE PRODUCT
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {

      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      await product.destroy();

      res.json({
        message: "Product deleted",
      });

    } catch (error) {

      res.status(500).json({
        error: error.message,
      });
    }
  }
);

// GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {

  try {

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;