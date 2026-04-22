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
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
  },
  created_at: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
}, { 
  tableName: "activity_logs",
  timestamps: false 
});

// Export the model directly
module.exports = Log;
