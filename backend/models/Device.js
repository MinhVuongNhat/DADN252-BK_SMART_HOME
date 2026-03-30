// models/Device.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User"); 

const Device = sequelize.define(
  "Device",
  {
    device_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    type: { type: DataTypes.STRING(50), allowNull: false }, // light, fan, ...
    location: { type: DataTypes.STRING(100) },
    mqtt_topic_sub: { type: DataTypes.STRING(200) },
    mqtt_topic_pub: { type: DataTypes.STRING(200) },
    connection_status: { 
      type: DataTypes.STRING(20), 
      defaultValue: "offline",
      validate: { isIn: [["online","offline"]] } 
    },
    power_status: { 
      type: DataTypes.STRING(20), 
      defaultValue: "off",
      validate: { isIn: [["on","off"]] } 
    },
    last_seen: { type: DataTypes.DATE },
    control_mode: { 
      type: DataTypes.STRING(20), 
      defaultValue: "manual",
      validate: { isIn: [["manual","schedule","automation"]] }
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  { tableName: "devices", timestamps: false }
);

module.exports = Device;