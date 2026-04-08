## 🚀 BK SmartHome – Realtime IoT Monitoring Dashboard
### 📌 Giới thiệu
BK SmartHome là một hệ thống giám sát thiết bị IoT toàn diện, cho phép thu thập, lưu trữ và trực quan hóa dữ liệu từ các cảm biến (nhiệt độ, độ ẩm, ánh sáng) theo thời gian thực. Hệ thống được thiết kế linh hoạt, hỗ trợ cả điều khiển thủ công và tự động hóa thông qua lịch trình hoặc điều kiện cảm biến.
Hệ thống sử dụng giao thức MQTT để nhận dữ liệu từ thiết bị, xử lý ở backend và truyền realtime tới frontend thông qua WebSocket (Socket.IO).

### 🎯 Mục tiêu dự án
 - Thu thập dữ liệu cảm biến theo thời gian thực
 - Lưu trữ dữ liệu lịch sử phục vụ phân tích
 - Hiển thị dashboard realtime

### 🧠 Kiến trúc hệ thống
IoT Devices (Sensors)
        ↓
     MQTT Broker (Adafruit IO)
        ↓
     Backend (Node.js)
        ↓
     Database (SQL Server)
        ↓
     Socket.IO (Realtime)
        ↓
     Frontend (React Dashboard)

### ⚙️ Công nghệ sử dụng
🔹 Backend
Node.js
Express.js
Socket.IO (Realtime communication)
MQTT (kết nối IoT)
Sequelize (ORM)
SQL Server
🔹 Frontend
ReactJS
Axios (API calls)
Socket.IO Client
Recharts (biểu đồ)
Tailwind CSS
🔹 IoT & Data
MQTT Protocol
Adafruit IO (MQTT Broker)
Time-series data processing

### 📊 Chức năng chính
 - Nhận dữ liệu cảm biến qua MQTT
 - Lưu dữ liệu vào database
 - Cập nhật realtime qua WebSocket
 - Hiển thị biểu đồ lịch sử & realtime
 - Dashboard tổng quan hệ thống

### 📂 Cấu trúc thư mục
project-root/
BE
|   Creat_DB_and_Table.sql
|   package-lock.json
|   package.json
|   server.js
|   tree.txt
|   
+---config
|       db.js
|       mqtt.js
|       socket.js
|       
+---controllers
|       auth.controller.js
|       automation.controller.js
|       dashboard.controller.js
|       device.controller.js
|       log.controller.js
|       schedule.controller.js
|       sensor.controller.js
|       
+---middlewares
|       auth.middleware.js
|       
+---models
|       Alert.js
|       Automation.js
|       Device.js
|       index.js
|       Log.js
|       Schedule.js
|       Sensor.js
|       SensorData.js
|       User.js
|       
+---node_modules
+---routes
|       auth.routes.js
|       automation.routes.js
|       dashboard.routes.js
|       device.routes.js
|       log.routes.js
|       schedule.routes.js
|       sensor.routes.js
|       
+---services
|       automation.service.js
|       mqtt.service.js
|       schedule.service.js
|       socket.service.js
|       
+---utils
|       jwt.js
|       
\---workers
        automation.worker.js
        schedule.worker.js
FE
|   .gitignore
|   eslint.config.js
|   index.html
|   package-lock.json
|   package.json
|   postcss.config.js
|   README.md
|   tailwind.config.js
|   tree.txt
|   vite.config.js
|
+---public
|       favicon.svg
|       icons.svg
|       
\---src
    |   App.css
    |   App.jsx
    |   index.css
    |   main.jsx
    |   
    +---api
    |       axios.js
    |       dashboard.api.js
    |       device.api.js
    |       log.api.js
    |       mock.js
    |       
    +---assets
    |       arrow-right Copy.svg
    |       cam-bien-anh-sang.png
    |       cam-bien-nhiet-do-do-am-dht20.png
    |       fan.png
    |       hero.png
    |       home-icon.svg
    |       icon-mail.svg
    |       icon-user.svg
    |       info.svg
    |       led.png
    |       lock.svg
    |       lock1.svg
    |       logo brand bk.jpg
    |       logo.svg
    |       phone.svg
    |       react.svg
    |       vite.svg
    |       
    +---components
    |   +---automation
    |   |       AutomationRule.jsx
    |   |       
    |   +---cards
    |   |       DeviceCard.jsx
    |   |       DeviceControl.jsx
    |   |       SensorCard.jsx
    |   |       StatCard.jsx
    |   |       
    |   +---chart
    |   |       RealtimeChart.jsx
    |   |       
    |   \---modal
    |           DeviceModal.jsx
    |           
    +---hooks
    |       useSocket.js
    |       
    +---layout
    |       Sidebar.jsx
    |       
    +---pages
    |   |   chart.jsx
    |   |   Dashboard.jsx
    |   |   Devices.jsx
    |   |   Logs.jsx
    |   |   Profile.jsx
    |   |   
    |   +---Login
    |   |       Login.css
    |   |       Login.jsx
    |   |       
    |   \---Sign up
    |           Signup.css
    |           Signup.jsx
    |           
    \---socket
            socket.js
               

### 🔌 APIs END POINT
🧠 AUTH (LOGIN / REGISTER + JWT)
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
Response login:
{
  "accessToken": "jwt_token",
  "user": {
    "id": 1,
    "username": "admin"
  }
}

📊 Dashboard APIs
1. Tổng quan
GET /api/dashboard/summary
Response json:
{
  "totalDevices": 8,
  "totalSensors": 3,
  "alerts": 5
}

2. Sensor realtime (latest)
GET /api/sensors/latest
lấy từ latest_sensor_values

3. Chart data
GET /api/sensors/history?sensorType=temperature
lấy từ sensor_data

4. Device control
POST /api/devices/:id/control
json Body:
{
  "action": "turn_on"
}
5. Alerts
GET /api/alerts?unresolved=true

6. Realtime (Socket.io)
Frontend:
socket.on("sensor-data", (data) => {
  updateChart(data);
});

Backend:
io.emit("sensor-data", data);

🚀 Devices APIs
1. Lấy danh sách thiết bị cho Device.jsx
GET /api/devices
Response json:
{
  "data": [
    {
      "id": 1,
      "name": "Đèn phòng khách",
      "type": "light",
      "power_status": "on",
      "control_mode": "manual",
      "connection_status": "online"
    }
  ]
}

2. Tạo thiết bị
POST /api/devices
{
  "name": "Đèn mới",
  "type": "light",
  "location": "Phòng ngủ"
}

3. Cập nhật thiết bị (modal Xong)
PUT /api/devices/:id
{
  "name": "Đèn 01",
  "power_status": "on",
  "control_mode": "schedule"
}

4. Xóa thiết bị
DELETE /api/devices/:id

5. Thay đổi switch, trạng thái, mode
PATCH /api/devices/:id
{ 
  "power_status": "on" 
} 
hoặc
{ 
  "control_mode": "automation" 
}

6. Quick devices (dashboard đã bỏ)
GET /api/devices/quick
{
  "light": true,
  "fan": false
}

🌡️ Sensor APIs
1. Danh sách sensor
GET /api/sensors
{
  "data": [
    {
      "id": 1,
      "name": "Nhiệt độ",
      "type": "temperature",
      "value": 28.5,
      "unit": "°C",
      "status": "active"
    }
  ]
}

2. Thêm sensor
POST /api/sensors

3. Thay đổi status
PATCH /api/sensors/:id

4. Xóa sensor
DELETE /api/sensors/:id

5. Latest data
GET /api/sensors/latest

6. History
GET /api/sensors/history?sensorId=1

🤖 Automation Rule Engine
1. Danh sách rule
GET /api/automation
{
  "data": [
    {
      "id": 1,
      "name": "Bật quạt khi nóng",
      "is_active": true,
      "condition": {
        "sensor": "temperature",
        "operator": ">",
        "value": 30
      },
      "action": {
        "device": "fan",
        "type": "turn_on"
      }
    }
  ]
}

2. Tạo rule
POST /api/automation
{
  "name": "Bật đèn khi tối",
  "condition": {
    "sensor_id": 3,
    "operator": "<",
    "value": 100
  },
  "action": {
    "device_id": 1,
    "type": "turn_on"
  }
}

3. Sửa rule
PUT /api/automation/:id

4. Bật/tắt rule
PATCH /api/automation/:id/toggle

5. Xóa rule
DELETE /api/automation/:id

⏰ Schedule APIs (Cho Modal)
1. Lấy schedule
GET /api/devices/:id/schedules

2. Tạo schedule
POST /api/schedules
{
  "device_id": 1,
  "time_start": "18:30",
  "time_end": "21:30",
  "days": "1,2,3,4,5"
}

3. Cập nhập schedule
PUT /api/schedules/:id

4. Xóa schedule
DELETE /api/schedules/:id

📜 Logs APIs
1. Danh sách Lịch sử
GET /api/logs?page=1&limit=10
{
  "data": [
    {
      "log_id": 1,
      "device_name": "Đèn phòng khách",
      "action_type": "CONTROL",
      "description": "Người dùng admin đã bật đèn",
      "created_at": "2026-03-29T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "totalPages": 5
  }
}

🔔 ALERTS
1. Alert
GET /api/alerts?page=1&limit=10
{
  "data": [
    {
      "alert_id": 1,
      "severity": "critical",
      "message": "Nhiệt độ quá cao",
      "is_resolved": false,
      "created_at": "2026-03-29T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "totalPages": 2
  }
}

2. Giải quyết Alert
PATCH /api/alerts/:id/resolve

3. Danh sách Alert
GET /api/alerts

👤 USER / PROFILE
1. Lấy profile
GET /api/profile

2. Update profile
PUT /api/profile
PUT /api/profile/password
PUT /api/home

⚡ SOCKET.IO (REALTIME)
1. Server emit:
io.emit("sensor-data", {
  type: "temperature",
  value: 30
});

2. Device realtime:
io.emit("device-update", {
  id: 1,
  power_status: "on"
});

3. FE listen:
socket.on("device-update", (data) => {
  updateDeviceUI(data);
});

🔌 MQTT FLOW
1. Ingestion
mqtt.on("message", async (topic, payload) => {
  saveToDB();
  io.emit("sensor-data");
});
2. Control
POST /devices/:id/control
→ publish MQTT

### 🛠️ Cài đặt & chạy dự án
1. Clone project
git clone https://github.com/your-repo/bk-smarthome.git
cd bk-smarthome

2. Backend
cd backend
npm install

Tạo file .env
PORT=5000
DB_HOST=localhost
DB_USER=your_user
DB_PASS=your_password
DB_NAME=smarthome

MQTT_USERNAME=your_adafruit_username
MQTT_PASSWORD=your_adafruit_key
MQTT_BROKER=io.adafruit.com
MQTT_PORT=1883

Chạy server
npm start

3. Frontend
cd frontend
npm install
npm run dev

### 🧪 Test hệ thống
Test MQTT
Gửi dữ liệu từ Adafruit IO feed:
nhietdo
doam
anhsang
Test Realtime
Mở dashboard
Quan sát:
Sensor value thay đổi ngay lập tức
Chart update realtime

### 📈 Hướng phát triển
Xây dựng Data Warehouse (Star Schema)
Tích hợp Power BI / Tableau
Thêm alert & notification system
Triển khai Kafka / Redis cho scale lớn
Multi-device management