const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AutomationCondition = sequelize.define(
  "AutomationCondition",
  {
    condition_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    rule_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    sensor_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    operator: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    target_value: {
      type: DataTypes.DECIMAL(12, 4),
    },
    duration_sec: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "automation_conditions",
    timestamps: false,
  }
);

module.exports = AutomationCondition;