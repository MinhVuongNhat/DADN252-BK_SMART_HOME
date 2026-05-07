require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const sequelize = require("./config/db");
const dashboardRoutes = require("./routes/dashboard.routes");
const socketService = require("./services/socket.service");
<<<<<<< Updated upstream
=======
const userRoutes = require("./routes/user.routes");
const deviceRoutes = require("./routes/device.routes");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
>>>>>>> Stashed changes

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

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("BK SmartHome API running 🚀");
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/devices", deviceRoutes);

sequelize.authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.error("❌ Database connection error:", err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});