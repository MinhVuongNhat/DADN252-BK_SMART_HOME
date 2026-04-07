## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

Cấu trúc thư mục:
ª   App.css
ª   App.jsx
ª   cau_truc.txt
ª   index.css
ª   main.jsx
ª   
+---api
ª       axios.js
ª       dashboard.api.js
ª       device.api.js
ª       mock.js
ª       
+---assets
ª       cam-bien-anh-sang.png
ª       cam-bien-nhiet-do-do-am-dht20.png
ª       fan.png
ª       hero.png
ª       led.png
ª       react.svg
ª       vite.svg
ª       
+---components
ª   +---automation
ª   ª       AutomationRule.jsx
ª   ª       
ª   +---cards
ª   ª       DeviceCard.jsx
ª   ª       DeviceControl.jsx
ª   ª       SensorCard.jsx
ª   ª       StatCard.jsx
ª   ª       
ª   +---chart
ª   ª       RealtimeChart.jsx
ª   ª       
ª   +---modal
ª           DeviceModal.jsx
ª           
+---hooks
ª       useSocket.js
ª       
+---layout
ª       Sidebar.jsx
ª       
+---pages
ª       chart.jsx
ª       Dashboard.jsx
ª       Devices.jsx
ª       Logs.jsx
ª       Profile.jsx
ª       
+---socket
        socket.js

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

5. Toggle nhanh (switch)
POST /api/devices/:id/toggle
{
  "type": "power" // hoặc "mode"
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

3. Xóa sensor
DELETE /api/sensors/:id

4. Latest (bạn đã có)
GET /api/sensors/latest

5. History
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

3. Bật/tắt rule
PATCH /api/automation/:id/toggle

4. Xóa rule
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