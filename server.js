require("dotenv").config(); 
require('./src/models'); 
const express = require('express');
const app = express();
const wishlistRoutes = require("./src/routes/wishlistRoutes");
// ✅ Routes
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/OrderRoutes');
const cors = require('cors');
const reviewRoutes = require("./src/routes/reviewRoutes");



app.use(cors());
const adminRoutes = require("./src/routes/adminRoutes");
app.use("/api/admin", adminRoutes);
// ✅ DB
const sequelize = require('./src/config/db');
const passport = require('passport');
app.use(passport.initialize());
// ✅ Middleware
app.use(express.json());

// ✅ Routes use
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);



// ✅ Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

// ✅ Sync DB
sequelize.sync({ alter: true })
  .then(() => console.log("Tables created"))
  .catch(err => console.log(err));

  app.get('/', (req, res) => {
  res.send("Server working");
});