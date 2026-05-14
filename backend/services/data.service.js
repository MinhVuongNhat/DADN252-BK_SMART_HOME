const Device = require("../models/Device");
const { Sensor, SensorData, LatestSensorValue } = require("../models/Sensor");

class DataService {

  async update(topic, message) {
    try {
      const parts = topic.split("/");
      if (parts.length < 3) return;

      const feedKey = parts[2];

      // 1. Nếu là dữ liệu Sensor
      if (["nhietdo", "doam", "anhsang"].includes(feedKey)) {
        await this.handleSensorData(feedKey, message);
      }

      // 2. Nếu là trạng thái Device (từ thiết bị gửi lên)
      if (feedKey.startsWith("device-") && feedKey.endsWith("-status")) {
        await this.handleDeviceStatus(feedKey, message);
      }

    } catch (error) {
      console.error("❌ DataService Error:", error);
    }
  }

  // --- Logic lưu Sensor ---
  async handleSensorData(feedKey, value) {
    try {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) return;

      const sensor = await Sensor.findOne({ where: { mqtt_topic: feedKey } });
      if (!sensor) return;

   
      await SensorData.create({
        sensor_id: sensor.sensor_id,
        value: numericValue,
        recorded_at: new Date(),
      });

      await LatestSensorValue.upsert({
        sensor_id: sensor.sensor_id,
        current_value: numericValue,
        recorded_at: new Date(),
        updated_at: new Date(),
      });

      console.log(`💾 DataService: Lưu thành công Sensor [${feedKey}] = ${numericValue}`);
    } catch (error) {
      console.error("❌ DataService - Lỗi lưu Sensor Data:", error);
    }
  }

  // --- Logic lưu Device Status ---
  async handleDeviceStatus(feedKey, data) {
    try {
      const match = feedKey.match(/device-(\d+)-status/);
      if (!match) return;

      const deviceId = match[1];
      let parsedData = data;
      try { parsedData = JSON.parse(data); } catch(e) {}

      await Device.update(
        {
          power_status: parsedData.power_status || parsedData.status || data,
          connection_status: "online",
          last_seen: new Date(),
        },
        { where: { device_id: deviceId } } 
      );

      console.log(`💾 DataService: Cập nhật trạng thái Device [${deviceId}]`);
    } catch (error) {
      console.error("❌ DataService - Lỗi cập nhật Device:", error);
    }
  }
}

module.exports = new DataService();