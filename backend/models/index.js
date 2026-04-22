// models/index.js
const sequelize = require("../config/db");

const User = require("./User");
const { Sensor, SensorData, LatestSensorValue } = require("./Sensor");
const Alert = require("./Alert");
const Device = require("./Device");
const Home = require("./Home");
const Schedule = require("./Schedule");
// User <-> Sensor
User.hasMany(Sensor, { foreignKey: "user_id" });
Sensor.belongsTo(User, { foreignKey: "user_id" });

// Sensor <-> SensorData
Sensor.hasMany(SensorData, { foreignKey: "sensor_id" });
SensorData.belongsTo(Sensor, { foreignKey: "sensor_id" });

// Sensor <-> LatestValue
Sensor.hasOne(LatestSensorValue, { foreignKey: "sensor_id" });
LatestSensorValue.belongsTo(Sensor, { foreignKey: "sensor_id" });

// Sensor <-> Alert
Sensor.hasMany(Alert, { foreignKey: "sensor_id" });
Alert.belongsTo(Sensor, { foreignKey: "sensor_id" });

// User <-> Device
User.hasMany(Device, { foreignKey: "user_id" });
Device.belongsTo(User, { foreignKey: "user_id" });

// Device <-> Schedule
Device.hasMany(Schedule, { foreignKey: "device_id" });
Schedule.belongsTo(Device, { foreignKey: "device_id" });

// Home <-> User
Home.hasMany(User, { foreignKey: "home_id" });
User.belongsTo(Home, { foreignKey: "home_id" });

module.exports = { 
  sequelize, 
  User, 
  Home,
  Sensor, 
  SensorData, 
  LatestSensorValue, 
  Alert, 
  Device,
  Schedule
};
