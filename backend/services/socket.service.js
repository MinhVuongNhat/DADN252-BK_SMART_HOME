let io;

exports.init = (server) => {

  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {

    console.log("Dashboard connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Dashboard disconnected");
    });

  });

};

// gửi dữ liệu sensor realtime
exports.sendSensorUpdate = (data) => {

  if (io) {
    io.emit("sensor_update", data);
  }

};