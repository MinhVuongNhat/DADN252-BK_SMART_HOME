// models/Alert.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Sensor = require("./Sensor");

const Alert = sequelize.define("Alert", {
  alert_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  sensor_id: { type: DataTypes.BIGINT, allowNull: false },
  severity: { type: DataTypes.STRING, defaultValue: "warning" },
  message: { type: DataTypes.TEXT, allowNull: false },
  is_resolved: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: "alerts", timestamps: false });


module.exports = Alert;