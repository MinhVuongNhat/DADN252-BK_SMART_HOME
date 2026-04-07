require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const sequelize = require("./config/db");
const dashboardRoutes = require("./routes/dashboard.routes");
const socketService = require("./services/socket.service");

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

sequelize.authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.error("❌ Database connection error:", err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});