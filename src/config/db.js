const { Sequelize } = require('sequelize');

// Create connection
const sequelize = new Sequelize(
  'ecommerce',   // DB name
  'root',        // username
  'salman123',// password
  {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
  }
);

// Test connection
sequelize.authenticate()
  .then(() => console.log("Database connected"))
  .catch(err => console.log("Error:", err));

module.exports = sequelize;