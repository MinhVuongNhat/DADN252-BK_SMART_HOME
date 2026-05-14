const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AutomationAction = sequelize.define(
  "AutomationAction",
  {
    action_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    rule_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    device_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    action_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    target_value: {
      type: DataTypes.DECIMAL(12, 4),
    },
    delay_seconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "automation_actions",
    timestamps: false,
  }
);

module.exports = AutomationAction;