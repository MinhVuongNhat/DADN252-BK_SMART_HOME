const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 
const User = require("./User"); 
// Sensor
const Sensor = sequelize.define("Sensor", {
  sensor_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: DataTypes.BIGINT,
  name: DataTypes.STRING,
  type: DataTypes.STRING,
  unit: DataTypes.STRING,
  mqtt_topic: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  last_seen: DataTypes.DATE,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: "sensors", timestamps: false });

// SensorData (Time-series)
const SensorData = sequelize.define("SensorData", {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  sensor_id: { type: DataTypes.BIGINT, allowNull: false },
  value: { type: DataTypes.DECIMAL(12,1), allowNull: false },
  recorded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  is_processed: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: "sensor_data", timestamps: false });

// LatestSensorValue
const LatestSensorValue = sequelize.define("LatestSensorValue", {
  sensor_id: { type: DataTypes.BIGINT, primaryKey: true },
  current_value: DataTypes.DECIMAL,
  recorded_at: DataTypes.DATE,
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: "latest_sensor_values", timestamps: false });

module.exports = { Sensor, SensorData, LatestSensorValue };