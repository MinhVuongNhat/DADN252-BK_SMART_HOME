const mqtt = require("mqtt");
const mqttConfig = require("../config/mqtt");

class MQTTService {
  constructor() {
    if (!MQTTService.instance) {
      this.client = null;
      this.observers = [];
      MQTTService.instance = this;
    }
    return MQTTService.instance;
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notifyAll(topic, message) {
    this.observers.forEach((observer) => observer.update(topic, message));
  }

  async connect() {
    try {
      const brokerURL = `mqtt://${mqttConfig.broker}:${mqttConfig.port}`;
      this.client = mqtt.connect(brokerURL, {
        username: mqttConfig.username,
        password: mqttConfig.password,
        clientId: mqttConfig.clientId,
      });

      this.client.on("connect", () => {
        console.log("✅ MQTT Singleton Connected");
        this.client.subscribe(`${mqttConfig.username}/feeds/+`);
      });
      this.client.on("message", (topic, payload) => {
        const message = payload.toString();
      
        console.log(`📩 [MQTT RECV] Topic: ${topic} | Message: ${message}`);
        this.notifyAll(topic, message);
      });

      this.client.on("error", (err) => {
        console.error("❌ MQTT LỖI KẾT NỐI:", err.message);
      });

      this.client.on("offline", () => {
        console.warn("⚠️ MQTT đang bị Offline rồi bà ơi!");
      });

      this.client.on("reconnect", () => {
        console.log("🔄 Đang thử kết nối lại với Adafruit...");
      });
      // --------------------------------
    } catch (error) {
      console.error("❌ MQTT Connection Failed:", error);
    }
  }

  publish(topic, command) {
    if (this.client && this.client.connected) {
      
      const payload =
        command === "ON" || command === "on" || command === "3" ? "3" : "0";

      this.client.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌ Publish Error on ${topic}:`, err);
        } else {
          console.log(
            `🚀 [MQTT SEND] Topic: ${topic} | Payload: ${payload} (Lệnh: ${command})`,
          );
        }
      });
    }
  }
}

module.exports = new MQTTService();
