// backend/controllers/dashboard.controller.js
const db = require("../config/db"); // db ở đây là instance của Sequelize
const { QueryTypes } = require("sequelize");

// Lấy dữ liệu sensor mới nhất cho card dashboard
exports.getLatestSensors = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT 
        s.sensor_id AS id,
        s.name,
        l.current_value,
        l.recorded_at
      FROM latest_sensor_values l
      JOIN sensors s ON s.sensor_id = l.sensor_id
      ORDER BY s.sensor_id
      `,
      { type: QueryTypes.SELECT }
    );

    res.json(result); // Sequelize trả thẳng mảng JSON
  } catch (err) {
    console.error("Error in getLatestSensors:", err);
    res.status(500).json({ error: err.message });
  }
};

// Lấy dữ liệu history cho chart
exports.getSensorHistory = async (req, res) => {
  try {
    const { sensorId } = req.params;

    const result = await db.query(
      `
      SELECT TOP 100 value, recorded_at
      FROM sensor_data
      WHERE sensor_id = :sensorId
      ORDER BY recorded_at DESC
      `,
      {
        replacements: { sensorId },
        type: QueryTypes.SELECT
      }
    );

    res.json(result);
  } catch (err) {
    console.error("Error in getSensorHistory:", err);
    res.status(500).json({ error: err.message });
  }
};