let io;

exports.init = (ioInstance) => {
  io = ioInstance;
  io.on("connection", (socket) => {
    console.log("Dashboard connected:", socket.id);
    socket.on("disconnect", () => console.log("Dashboard disconnected"));
  });
};

/**
 * Send real-time sensor data update to connected clients
 */
exports.sendSensorUpdate = (data) => {
  if (io) {
    io.emit("sensor-data", data);
  }
};

/**
 * Send real-time device status update to connected clients
 */
exports.emitDeviceUpdate = (data) => {
  if (io) {
    io.emit("device-update", data);
  }
};

/**
 * Send device command response to connected clients
 * (Used for command acknowledgment feedback)
 */
exports.emitDeviceResponse = (data) => {
  if (io) {
    io.emit("device-response", data);
  }
};