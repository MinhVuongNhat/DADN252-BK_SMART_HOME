const sequelize = require("../config/db");

const User = require("./User");
const Device = require("./Device");
const Home = require("./Home");
const AutomationRule = require('./AutomationRule');
const AutomationCondition = require('./AutomationCondition');
const AutomationAction = require('./AutomationAction');

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

// 1. Một Rule có nhiều Condition
AutomationRule.hasMany(AutomationCondition, { foreignKey: 'rule_id' });
AutomationCondition.belongsTo(AutomationRule, { foreignKey: 'rule_id' });

// 2. Một Rule có nhiều Action
AutomationRule.hasMany(AutomationAction, { foreignKey: 'rule_id' });
AutomationAction.belongsTo(AutomationRule, { foreignKey: 'rule_id' });

// 3. Condition liên kết với Sensor (Để lấy tên cảm biến)
AutomationCondition.belongsTo(Sensor, { foreignKey: 'sensor_id' });
Sensor.hasMany(AutomationCondition, { foreignKey: 'sensor_id' });

// 4. Action liên kết với Device (Để lấy tên thiết bị)
AutomationAction.belongsTo(Device, { foreignKey: 'device_id' });
Device.hasMany(AutomationAction, { foreignKey: 'device_id' });

module.exports = {
  sequelize,
  User,
  Device,
  Home,
  Sensor,
  SensorData,
  LatestSensorValue,
  AutomationRule,
  AutomationCondition,
  AutomationAction
};