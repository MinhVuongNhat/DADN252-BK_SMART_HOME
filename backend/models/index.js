const sequelize = require("../config/db");

const User = require("./User");
const Device = require("./Device");
const Home = require("./Home");

const {
  Sensor,
  SensorData,
  LatestSensorValue,
} = require("./Sensor");

// Associations
User.hasMany(Sensor, { foreignKey: "user_id" });
Sensor.belongsTo(User, { foreignKey: "user_id" });

Sensor.hasMany(SensorData, { foreignKey: "sensor_id" });
SensorData.belongsTo(Sensor, { foreignKey: "sensor_id" });

Sensor.hasOne(LatestSensorValue, { foreignKey: "sensor_id" });
LatestSensorValue.belongsTo(Sensor, { foreignKey: "sensor_id" });

User.hasMany(Device, { foreignKey: "user_id" });
Device.belongsTo(User, { foreignKey: "user_id" });

Home.hasMany(User, { foreignKey: "home_id" });
User.belongsTo(Home, { foreignKey: "home_id" });

module.exports = {
  sequelize,
  User,
  Device,
  Home,
  Sensor,
  SensorData,
  LatestSensorValue,
};