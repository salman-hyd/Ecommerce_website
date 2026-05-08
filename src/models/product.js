const { DataTypes } =require('sequelize');
const sequelize=require('../config/db');
const upload = require("../middleware/upload");
const Product =sequelize.define('product',{
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    price:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    description:{
        type:DataTypes.STRING,
    },
    stock:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        allowNull:false
    },
    image: {
  type: DataTypes.STRING,
  allowNull: true
},
});

module.exports=Product;