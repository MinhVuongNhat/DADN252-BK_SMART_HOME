require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const sequelize = require("./config/db");
const dashboardRoutes = require("./routes/dashboard.routes");
const socketService = require("./services/socket.service");
const userRoutes = require("./routes/user.routes");
const scheduleRoutes = require("./routes/schedule.routes");
const scheduleWorker = require("./workers/schedule.worker");

require("./services/mqtt.service");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

socketService.init(io);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("BK SmartHome API running 🚀");
});

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/user", userRoutes);
app.use("/api", scheduleRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
sequelize.authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.error("❌ Database connection error:", err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
  scheduleWorker.start();
});



/* 
http://localhost:5000/api/dashboard/summary
http://localhost:5000/api/dashboard/sensors/latest
http://localhost:5000/api/dashboard/sensors/history?sensorType=temperature
*/