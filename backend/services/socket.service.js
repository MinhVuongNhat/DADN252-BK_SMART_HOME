let io;

exports.init = (ioInstance) => {
  io = ioInstance;
  io.on("connection", (socket) => {
    console.log("Dashboard connected:", socket.id);
    socket.on("disconnect", () => console.log("Dashboard disconnected"));
  });
};
// gửi dữ liệu sensor realtime
exports.sendSensorUpdate = (data) => {

  if (io) {
    io.emit("sensor-data", data);
  }

};