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
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notifyAll(topic, message) {
    this.observers.forEach(observer => observer.update(topic, message));
  }

  async connect() {
    try {
      const brokerURL = `mqtt://${mqttConfig.broker}:${mqttConfig.port}`;
      this.client = mqtt.connect(brokerURL, {
        username: mqttConfig.username,
        password: mqttConfig.password,
      });

      this.client.on("connect", () => {
        console.log("✅ MQTT Singleton Connected");
        this.client.subscribe(`${mqttConfig.username}/feeds/+`);
      });

      this.client.on("message", (topic, payload) => {
        const message = payload.toString();
        this.notifyAll(topic, message);
      });

    } catch (error) {
      console.error("❌ MQTT Connection Failed:", error);
    }
  }

  // [LOGIC BỊ THIẾU] Trả lại cấu trúc Payload chuẩn cho Yolo:Bit
  publish(topic, command) {
    if (this.client && this.client.connected) {
      const payload = {
        command_id: `cmd-${Date.now()}`,
        command: command,
        timestamp: new Date().toISOString()
      };
      
      this.client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) console.error(`❌ Publish Error on ${topic}:`, err);
        else console.log(`🚀 Published to ${topic}:`, payload);
      });
    }
  }
}

module.exports = new MQTTService();