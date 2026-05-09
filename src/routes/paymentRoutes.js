const express = require("express");
const router = express.Router();

const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  try {

    const { products } = req.body;

    console.log(products);

    const line_items = products.map((item) => ({

      price_data: {
        currency: "inr",

        product_data: {
          name: item.Product?.name || "Product",
        },

        unit_amount: Number(item.Product?.price || 0) * 100,
      },

      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({

      payment_method_types: ["card"],

      line_items,

      mode: "payment",

      success_url: "http://localhost:3000/success",

      cancel_url: "http://localhost:3000/cart",

    });

    res.json({
      id: session.id,
    });

  } catch (err) {

    console.log("STRIPE ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;