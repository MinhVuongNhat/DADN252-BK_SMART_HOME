const mqtt = require("mqtt");
const mqttConfig = require("../config/mqtt");
const Device = require("../models/Device");
const Log = require("../models/Log");
const { Sensor, SensorData, LatestSensorValue } = require("../models/Sensor");

// Import the whole module instead of destructuring to avoid circular dependencies
const socketService = require("./socket.service");

let client = null;

class MQTTService {
  // Initialize MQTT connection to Adafruit IO
  static async connect() {
    try {
      if (!mqttConfig.username || !mqttConfig.password) {
        throw new Error(
          "Missing Adafruit IO credentials in environment variables.",
        );
      }

      const options = {
        username: mqttConfig.username,
        password: mqttConfig.password,
        clientId: mqttConfig.clientId,
        reconnectPeriod: mqttConfig.reconnectPeriod,
        connectTimeout: mqttConfig.connectTimeout,
        keepalive: mqttConfig.keepalive,
      };

      const brokerURL = `mqtt://${mqttConfig.broker}:${mqttConfig.port}`;
      client = mqtt.connect(brokerURL, options);

      client.on("connect", () => {
        console.log("✅ Connected to Adafruit IO MQTT Broker");
        this.subscribeToTopics();
      });

      client.on("message", (topic, payload) => {
        this.handleMessage(topic, payload);
      });

      client.on("error", (error) => {
        console.error("❌ MQTT Connection Error:", error.message);
      });

      client.on("disconnect", () => {
        console.warn("⚠️ Disconnected from MQTT Broker");
      });

      return client;
    } catch (error) {
      console.error("❌ MQTT Connection Failed:", error);
      throw error;
    }
  }

  // Subscribe to device topics from database
  static subscribeToTopics() {
    try {
      // Subscribe to all sensor feeds for the user
      const topicString = `${mqttConfig.username}/feeds/+`;
      client.subscribe(topicString, { qos: 1 }, (err) => {
        if (err) console.error("❌ Subscribe Error:", err);
        else console.log(`✅ Subscribed to feeds: ${topicString}`);
      });
    } catch (error) {
      console.error("❌ Subscribe Topics Error:", error);
    }
  }

  // Publish device control command
  static async publishDeviceCommand(deviceId, command, options = {}) {
    try {
      if (!client || !client.connected) {
        console.error("❌ MQTT Client not connected");
        return false;
      }

      const device = await Device.findByPk(deviceId);
      if (!device) {
        console.error(`❌ Device ${deviceId} not found`);
        return false;
      }

      const feedKey = device.mqtt_topic_pub || `device-${deviceId}`;
      const topic = `${mqttConfig.username}/feeds/${feedKey}`;

      const payload = {
        command_id: `cmd-${Date.now()}`,
        device_id: deviceId,
        command,
        timestamp: new Date().toISOString(),
        ...options,
      };

      await new Promise((resolve, reject) => {
        client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
          if (err) {
            console.error(`❌ Publish Error on ${topic}:`, err);
            reject(err);
            return;
          }
          console.log(`✅ Published to ${topic}:`, payload);
          resolve();
        });
      });

      await Log.create({
        device_id: deviceId,
        action_type: options.source ? String(options.source).toUpperCase() : "CONTROL",
        description: `Command sent: ${command}`,
      });

      return true;
    } catch (error) {
      console.error("❌ Publish Command Error:", error);
      return false;
    }
  }

  // Handle incoming MQTT messages
  static async handleMessage(topic, payload) {
    try {
      const data = payload.toString();
      console.log(`📨 Message received on ${topic}:`, data);

      const parts = topic.split("/");
      if (parts.length < 3) return;

      const feedKey = parts[2];

      if (["nhietdo", "doam", "anhsang"].includes(feedKey)) {
        await this.handleSensorData(feedKey, data);
      }

      if (feedKey.startsWith("device-") && feedKey.endsWith("-status")) {
        await this.handleDeviceStatus(feedKey, data);
      }

      if (feedKey.startsWith("device-") && feedKey.endsWith("-response")) {
        await this.handleDeviceResponse(feedKey, data);
      }
    } catch (error) {
      console.error("❌ Handle Message Error:", error);
    }
  }
  // Process sensor data
  static async handleSensorData(feedKey, value) {
    try {
      const numericValue = parseFloat(value);

      // Lấy sensor tương ứng theo mqtt_topic
      const sensor = await Sensor.findOne({ where: { mqtt_topic: feedKey } });
      if (!sensor) {
        console.warn(`⚠️ Sensor not found for feedKey: ${feedKey}`);
        return;
      }

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

      if (socketService && socketService.io) {
        socketService.io.emit("sensor-data", {
          sensor_id: sensor.sensor_id,
          type: sensor.type,
          value: numericValue,
          unit: sensor.unit,
          timestamp: new Date(),
        });
      }

      console.log(
        `✅ Sensor data saved - ${sensor.name} (${feedKey}) = ${numericValue}`,
      );
      console.log("Emit sensor-data:", {
        sensor_id: sensor.sensor_id,
        type: sensor.type,
        value: numericValue,
      });
    } catch (error) {
      console.error("❌ Handle Sensor Data Error:", error);
    }
  }

  // Process device status
  static async handleDeviceStatus(feedKey, data) {
    try {
      const match = feedKey.match(/device-(\d+)-status/);
      if (!match) return;

      const deviceId = match[1];

      await Device.update(
        {
          power_status: data.power_status || data.status,
          connection_status: "online",
          last_seen: new Date(),
        },
        { where: { id: deviceId } },
      );

      if (socketService && socketService.io) {
        socketService.io.emit("device-update", {
          id: deviceId,
          power_status: data.power_status || data.status,
          connection_status: "online",
        });
      }

      console.log(
        `✅ Device status updated - Device ${deviceId}: ${data.power_status || data.status}`,
      );
    } catch (error) {
      console.error("❌ Handle Device Status Error:", error);
    }
  }

  // Process device response
  static async handleDeviceResponse(feedKey, data) {
    try {
      const match = feedKey.match(/device-(\d+)-response/);
      if (!match) return;

      const deviceId = match[1];

      if (socketService && socketService.io) {
        socketService.io.emit("device-response", {
          device_id: deviceId,
          command_id: data.command_id,
          status: data.status,
          message: data.message,
        });
      }

      console.log(`✅ Device response received - Device ${deviceId}:`, data);
    } catch (error) {
      console.error("❌ Handle Device Response Error:", error);
    }
  }

  static disconnect() {
    if (client) {
      client.end();
      console.log("🔌 MQTT Client disconnected");
    }
  }
}

MQTTService.connect().catch((err) => {
  console.error("❌ Failed to auto-connect MQTT on startup:", err);
});

module.exports = MQTTService;
