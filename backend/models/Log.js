const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Log = sequelize.define("Log", {
  log_id: { 
    type: DataTypes.BIGINT, 
    primaryKey: true, 
    autoIncrement: true 
  },

  user_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },

  device_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },

  action_type: {
    type: DataTypes.STRING(50), // NVARCHAR(50)
    allowNull: true
  },

  description: {
    type: DataTypes.TEXT, // NVARCHAR(MAX)
    allowNull: true
  },

  created_at: { 
    type: DataTypes.DATE, // Sequelize không có DATETIMEOFFSET riêng
    allowNull: true,
    defaultValue: DataTypes.NOW
  }

}, { 
  tableName: "activity_logs", // FIX
  timestamps: false 
});

module.exports = Log;