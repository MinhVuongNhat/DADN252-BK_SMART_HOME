const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AutomationRule = sequelize.define(
  "AutomationRule",
  {
    rule_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "automation_rules",
    timestamps: false,
  }
);

module.exports = AutomationRule;