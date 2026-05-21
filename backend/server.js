// require("dotenv").config();
// const path = require("path");
// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");

// const sequelize = require("./config/db");
// const dashboardRoutes = require("./routes/dashboard.routes");
// const socketService = require("./services/socket.service");

// const deviceRoutes = require("./routes/device.routes");

// const swaggerUi = require("swagger-ui-express");
// const swaggerSpec = require("./docs/swagger");

// const userRoutes = require("./routes/user.routes");
// const authRoutes = require('./routes/auth.routes');

// require("./services/mqtt.service");

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: "*" }
// });

// socketService.init(io);

// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerSpec)
// );

// app.use(cors());
// app.use(express.json());
// app.use('/api/auth', authRoutes);
// app.use('/api/sensors', require('./routes/sensor.routes'));

// app.get("/", (req, res) => {
//   res.send("BK SmartHome API running 🚀");
// });

// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/devices", deviceRoutes);

// app.use("/api/user", userRoutes);
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// sequelize.authenticate()
//   .then(() => console.log("✅ Database connected"))
//   .catch(err => console.error("❌ Database connection error:", err));

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log("Server running on port " + PORT);
// });

require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
// Bỏ cái require { Server } ở đây vì socketService sẽ tự lo việc đó

const sequelize = require("./config/db");
const dashboardRoutes = require("./routes/dashboard.routes");
const deviceRoutes = require("./routes/device.routes");
const userRoutes = require("./routes/user.routes");
const authRoutes = require('./routes/auth.routes');
const sensorRoutes = require('./routes/sensor.routes');
const logRoutes = require("./routes/log.routes");
// --- SWAGGER ---
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

require("./services/mqtt.service");
// --- IMPORT SERVICES (DESIGN PATTERNS) ---
const socketService = require("./services/socket.service");
const mqttService = require("./services/mqtt.service");
const dataService = require("./services/data.service");
const automationService = require("./services/automation.service");

const automationRoutes = require('./routes/automation.routes');

const app = express();
const server = http.createServer(app);

// ==========================================
// THIẾT LẬP DESIGN PATTERNS (OBSERVER)
// ==========================================

// 1. Khởi tạo Socket.io bên trong Service (Singleton)
socketService.init(server);

// 2. Đăng ký các Observers vào Subject (MQTT)
mqttService.subscribe(socketService);       // Nghe để đẩy data realtime lên Web
mqttService.subscribe(dataService);         // Nghe để lưu vào DB (SensorData, DeviceStatus)
mqttService.subscribe(automationService);   // Nghe để check Rule chạy tự động

// 3. Khởi động kết nối MQTT
mqttService.connect();

// ==========================================

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API DOCS ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- CÁC ĐƯỜNG DẪN CHÍNH (ROUTES) ---
app.get("/", (req, res) => {
  res.send("BK SmartHome API running 🚀");
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use("/api/user", userRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/devices", deviceRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/schedules', scheduleRoutes);

app.use('/api/logs', logRoutes);
app.use('/api/automation', automationRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
sequelize.authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.error("❌ Database connection error:", err));

// --- KHỞI ĐỘNG SERVER ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});