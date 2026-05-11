const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Home = sequelize.define("Home", {

  home_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },

  home_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  address: {
    type: DataTypes.STRING(255)
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "homes",
  timestamps: false
});

module.exports = Home;