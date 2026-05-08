const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Review extends Model {}

Review.init(
  {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    comment: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "Review",
  }
);

module.exports = Review;