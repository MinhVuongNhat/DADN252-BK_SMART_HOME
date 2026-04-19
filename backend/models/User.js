// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    user_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    home_id: { type: DataTypes.BIGINT, allowNull: true }, // FK, tạm thời chưa join Home
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true },
    phone: { type: DataTypes.STRING(20) },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "owner",
      validate: {
        isIn: [["owner", "user"]],
      },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active",
      validate: {
        isIn: [["active", "inactive", "suspended"]],
      },
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "users",
    timestamps: false,
  },
);

module.exports = User;
