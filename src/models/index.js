const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");


/* INITIALIZE MODELS */
const User = require("./User");
const Product = require("./product");
const Cart = require("./Cart");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Wishlist = require("./wishlist");
const Review = require("./review");

/* =========================
   RELATIONSHIPS
========================= */

/* CART */
User.hasMany(Cart, { foreignKey: "userId" });

Cart.belongsTo(User, {
  foreignKey: "userId",
});

Product.hasMany(Cart, {
  foreignKey: "productId",
});

Cart.belongsTo(Product, {
  foreignKey: "productId",
  as: "Product",
});

/* ORDERS */
User.hasMany(Order, {
  foreignKey: "userId",
});

Order.belongsTo(User, {
  foreignKey: "userId",
});

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
});

Product.hasMany(OrderItem, {
  foreignKey: "productId",
});

OrderItem.belongsTo(Product, {
  foreignKey: "productId",
});

/* WISHLIST */
User.hasMany(Wishlist, {
  foreignKey: "userId",
});

Wishlist.belongsTo(User, {
  foreignKey: "userId",
});

Product.hasMany(Wishlist, {
  foreignKey: "productId",
});

Wishlist.belongsTo(Product, {
  foreignKey: "productId",
  as: "Product",
});

/* REVIEWS */
User.hasMany(Review, {
  foreignKey: "userId",
});

Review.belongsTo(User, {
  foreignKey: "userId",
});

Product.hasMany(Review, {
  foreignKey: "productId",
});

Review.belongsTo(Product, {
  foreignKey: "productId",
});

/* EXPORTS */
module.exports = {
  sequelize,
  User,
  Product,
  Cart,
  Order,
  OrderItem,
  Wishlist,
  Review,
};