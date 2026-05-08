const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {   // important for admin panel)
    type: DataTypes.STRING,
    defaultValue: "pending"
  }
}, {
  timestamps: true
});

module.exports = Order;