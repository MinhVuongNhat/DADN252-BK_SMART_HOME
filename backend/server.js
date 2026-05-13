require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const sequelize = require("./config/db");
const dashboardRoutes = require("./routes/dashboard.routes");
const socketService = require("./services/socket.service");

const deviceRoutes = require("./routes/device.routes");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const userRoutes = require("./routes/user.routes");
const authRoutes = require('./routes/auth.routes');

const logRoutes = require("./routes/log.routes");

require("./services/mqtt.service");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

socketService.init(io);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.get("/", (req, res) => {
  res.send("BK SmartHome API running 🚀");
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use("/api/user", userRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/devices", deviceRoutes);
app.use('/api/sensors', require('./routes/sensor.routes'));

app.use('/api/logs', logRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
sequelize.authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.error("❌ Database connection error:", err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});