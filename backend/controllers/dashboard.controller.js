const { User, Sensor, Device, Alert, SensorData, LatestSensorValue } = require("../models");
// --- GET /api/dashboard/summary ---
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = 1;

    const totalDevices = await Device.count({ where: { user_id: userId } });
    const totalSensors = await Sensor.count({ where: { user_id: userId } });
    const alerts = await Alert.count({
      include: [
        {
          model: Sensor,
          where: { user_id: userId },
        },
      ],
      where: { is_resolved: false },
      distinct: true,
      col: "alert_id",
    });

    res.json({ totalDevices, totalSensors, alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// --- GET /api/sensors/latest ---
exports.getLatestSensors = async (req, res) => {
  try {
    const userId = 1;

    const sensors = await Sensor.findAll({
      where: { user_id: userId }, // chỉ lấy sensor của user này
      include: [
        { model: LatestSensorValue, required: false }, // join bảng LatestSensorValue
      ],
      order: [["sensor_id", "ASC"]],
    });

    const result = sensors.map((s) => ({
      sensor_id: s.sensor_id,
      name: s.name,
      type: s.type,
      unit: s.unit,
      current_value: s.LatestSensorValue?.current_value || 25,
      recorded_at: s.LatestSensorValue?.recorded_at || new Date(),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// --- GET /api/sensors/history?sensorType=temperature ---
exports.getSensorHistory = async (req, res) => {
  try {
    const userId = 1; // tạm thời hardcode
    const { sensorType } = req.query;

    if (!sensorType) {
      return res.status(400).json({ error: "sensorType query parameter is required" });
    }

    // Lấy tất cả sensor của user cùng loại
    const sensors = await Sensor.findAll({
      where: { user_id: userId, type: sensorType },
      attributes: ["sensor_id", "name"], 
      include: [
        {
          model: SensorData,
          attributes: ["value", "recorded_at"],
          limit: 100,
          order: [["recorded_at", "DESC"]],
        },
      ],
    });

    // gom tất cả data vào 1 mảng flat
    const history = sensors.flatMap((s) =>
      s.SensorData.map((d) => ({
        sensor_id: s.sensor_id,
        sensor_name: s.name,
        value: d.value,
        recorded_at: d.recorded_at,
      }))
    );

    // sắp xếp theo thời gian giảm dần
    history.sort((a, b) => b.recorded_at - a.recorded_at);

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};