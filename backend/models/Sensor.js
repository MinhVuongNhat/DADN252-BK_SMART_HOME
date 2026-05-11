const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// ================= SENSOR =================
const Sensor = sequelize.define(
  "Sensor",
  {
    sensor_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
    },
    type: {
      type: DataTypes.STRING(50), // temperature, humidity, light
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(20),
    },
    mqtt_topic: {
      type: DataTypes.STRING(200),
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "active",
      validate: {
        isIn: [["active", "inactive"]],
      },
    },
    last_seen: {
      type: DataTypes.DATE,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sensors",
    timestamps: false,
  }
);

// ================= SENSOR DATA =================
const SensorData = sequelize.define(
  "SensorData",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    sensor_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    recorded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sensor_data",
    timestamps: false,
  }
);

// ================= LATEST SENSOR VALUE (VIEW) =================
const LatestSensorValue = sequelize.define(
  "LatestSensorValue",
  {
    sensor_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    current_value: {
      type: DataTypes.FLOAT,
    },
    recorded_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "latest_sensor_values",
    timestamps: false,
  }
);

module.exports = {
  Sensor,
  SensorData,
  LatestSensorValue,
};