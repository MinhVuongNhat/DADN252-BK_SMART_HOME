const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Schedule = sequelize.define(
  "Schedule",
  {
    schedule_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    device_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    action_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [["turn_on", "turn_off", "set_level"]],
      },
    },
    target_value: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
    },
    time_start: {
      type: DataTypes.TIME,
      allowNull: false,
      get() {
        const value = this.getDataValue("time_start");
        if (value instanceof Date) return value.toISOString().slice(11, 19);
        if (typeof value === "string") return value.slice(0, 8);
        return value;
      },
    },
    days_of_week: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_run_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "schedules",
    timestamps: false,
  },
);

module.exports = Schedule;
