const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Schedule = sequelize.define("Schedule", {
  schedule_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },

  device_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'devices', // Tên bảng thực tế trong DB
      key: 'device_id'
    }
  },

  name: {
    type: DataTypes.STRING(100), // NVARCHAR(100)
    allowNull: true
  },

  action_type: {
    type: DataTypes.STRING(50), // NVARCHAR(50)
    allowNull: false
  },

  target_value: {
    type: DataTypes.DECIMAL(12, 4), // DECIMAL(12,4)
    allowNull: true
  },

  start_time: {
    type: DataTypes.TIME, // TIME
    allowNull: false
  },

  end_time: {
    type: DataTypes.TIME, // TIME
    allowNull: false
  },

  start_date: {
    type: DataTypes.DATEONLY, // DATE (Y-m-d)
    allowNull: true
  },

  end_date: {
    type: DataTypes.DATEONLY, // DATE (Y-m-d)
    allowNull: true
  },

  is_active: {
    type: DataTypes.BOOLEAN, // BIT
    defaultValue: true
  },

  last_run_at: {
    type: DataTypes.DATE, // DATETIMEOFFSET
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE, // DATETIMEOFFSET
    allowNull: true,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "schedules",
  timestamps: false // Vì đã tự định nghĩa created_at và dùng SYSDATETIMEOFFSET từ DB
});

module.exports = Schedule;