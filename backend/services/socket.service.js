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
    
    // 1. Nếu là dữ liệu Sensor -> Cập nhật biểu đồ/Card
    if (["nhietdo", "doam", "anhsang"].includes(feedKey)) {
      this.io.emit("sensor_update", {
        feed: feedKey,
        value: parseFloat(message),
        timestamp: new Date()
      });
    }

    // 2. [LOGIC BỊ THIẾU] Nếu thiết bị đổi trạng thái -> Cập nhật nút Bật/Tắt trên Web
    if (feedKey.startsWith("device-") && feedKey.endsWith("-status")) {
      const match = feedKey.match(/device-(\d+)-status/);
      if (match) {
        const deviceId = match[1];
        let statusValue = message;
        try { 
          const parsed = JSON.parse(message); 
          statusValue = parsed.power_status || parsed.status || message;
        } catch(e) {}

        this.io.emit("device-update", {
          id: deviceId,
          power_status: statusValue,
          connection_status: "online"
        });
      }
    }
  }
}

module.exports = new SocketService();