const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,

  role: {
    type: DataTypes.STRING,
    defaultValue: 'user'
  },

  image: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = User;