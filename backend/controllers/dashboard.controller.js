const db = require("../config/db");
const { QueryTypes } = require("sequelize");
const { Device, Sensor } = require("../models");

// 1. Lấy tổng số thiết bị, cảm biến CỦA USER ĐANG ĐĂNG NHẬP
exports.getSummary = async (req, res) => {
  try {
  
    const userId = req.user.user_id; 

    const totalDevices = await Device.count({ where: { user_id: userId } });
    const totalSensors = await Sensor.count({ where: { user_id: userId } });

    res.json({ totalDevices, totalSensors });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Lấy dữ liệu sensor mới nhất CỦA USER ĐANG ĐĂNG NHẬP
exports.getLatestSensors = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await db.query(
      `
      SELECT 
        s.sensor_id AS id,
        s.name,
        l.current_value,
        l.recorded_at
      FROM latest_sensor_values l
      JOIN sensors s ON s.sensor_id = l.sensor_id
      WHERE s.user_id = :userId
      ORDER BY s.sensor_id
      `,
      { 
        replacements: { userId },
        type: QueryTypes.SELECT 
      }
    );

    res.json(result);
  } catch (err) {
    console.error("Error in getLatestSensors:", err);
    res.status(500).json({ error: err.message });
  }
};

// 3. Lấy dữ liệu history (Có thể check thêm sensor này có thuộc về user không cho bảo mật)
exports.getSensorHistory = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const userId = req.user.user_id;

    const result = await db.query(
      `
      SELECT TOP 100 sd.value, sd.recorded_at
      FROM sensor_data sd
      JOIN sensors s ON sd.sensor_id = s.sensor_id
      WHERE sd.sensor_id = :sensorId AND s.user_id = :userId
      ORDER BY sd.recorded_at DESC
      `,
      {
        replacements: { sensorId, userId },
        type: QueryTypes.SELECT
      }
    );

    res.json(result);
  } catch (err) {
    console.error("Error in getSensorHistory:", err);
    res.status(500).json({ error: err.message });
  }
};