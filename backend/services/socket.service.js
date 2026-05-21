const { Server } = require("socket.io");

class SocketService {
  constructor() {
    if (!SocketService.instance) {
      this.io = null;
      SocketService.instance = this;
    }
    return SocketService.instance;
  }

  init(server) {
    this.io = new Server(server, { cors: { origin: "*" } });
    this.io.on("connection", (socket) => {
      console.log("🟢 Dashboard connected:", socket.id);
    });
  }

update(topic, message) {
    if (!this.io) return;


    const feedKey = topic.split('/').pop(); 
    console.log(`📡 SocketService nhận: [${feedKey}] = ${message}`);

    const sensorFeeds = ["nhietdo", "doam", "anhsang"];
    if (sensorFeeds.includes(feedKey)) {
        this.io.emit("sensor_update", {
            feed: feedKey,
            value: parseFloat(message) || 0, 
            timestamp: new Date()
        });
    }

    if (feedKey.includes("-status")) {
        const deviceId = feedKey.split('-')[1]; 
        this.io.emit("device_update", { 
            id: deviceId,
            power_status: message, 
            connection_status: "online"
        });
    }
}
}

module.exports = new SocketService();