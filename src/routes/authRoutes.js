const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const router = express.Router();

/* ================= GOOGLE STRATEGY ================= */

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          where: { email: profile.emails[0].value },
        });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: null,
            role: "user",
            image: profile.photos[0].value,
          });
        }

        // ✅ RETURN REAL USER (IMPORTANT)
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/* ================= GOOGLE ROUTES ================= */

// start login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    console.log("CALLBACK HIT ✅", req.user);

    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("TOKEN:", token);

    res.redirect(`http://localhost:3000/?token=${token}`);
  }
);
/* ================= REGISTER ================= */

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({ message: "User registered", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ ONLY JSON (NO REDIRECT HERE)
    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ================= USER ================= */

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ["id", "name", "email", "role", "image"],
  });

  res.json(user);
});

module.exports = router;