# Schedule API Documentation

This document explains how to run and test the current backend Schedule API.

## Current Scope

The current implementation covers:

- CRUD APIs for schedules.
- Runtime schedule worker using `node-cron`.
- MQTT publish to Adafruit IO when a schedule reaches its configured time.
- Device state update in SQL Server.
- Activity logs in `activity_logs`.

The current implementation does not include:

- Frontend schedule UI.
- Real hardware listener.
- IoT simulator listener.

At runtime, the flow is:

```text
POST /api/schedules
  -> insert schedule into SQL Server

node-cron worker, every minute
  -> find active due schedules
  -> publish command to Adafruit feed from devices.mqtt_topic_pub
  -> update devices.power_status and devices.control_mode
  -> update schedules.last_run_at
  -> write activity_logs
```

## Prerequisites

### 1. SQL Server

Start SQL Server:

```bash
docker compose up -d sqlserver
```

Verify SQL Server is running:

```bash
docker compose ps
```

Expected:

```text
smarthome-sqlserver   Up   0.0.0.0:1433->1433/tcp
```

Verify important tables:

```bash
docker compose exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sManager \
  -P 'Hello123@' \
  -C \
  -d smarthome \
  -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME;"
```

Expected tables include:

```text
activity_logs
devices
schedules
users
```

### 2. Backend Environment

The backend reads variables from `backend/.env`.

Required DB variables:

```env
DB_NAME=smarthome
DB_USER=sManager
DB_PASSWORD=Hello123@
DB_HOST=localhost
DB_PORT=1433
```

Required Adafruit IO variables:

```env
MQTT_BROKER=io.adafruit.com
MQTT_PORT=1883
MQTT_CLIENT_ID=backend-dev
ADAFRUIT_AIO_USERNAME=your_adafruit_username
ADAFRUIT_AIO_KEY=your_adafruit_key
```

Important: `MQTT_BROKER` should be `io.adafruit.com`, not `mqtt://io.adafruit.com`, because the backend already adds the `mqtt://` prefix.

### 3. Adafruit Feed

The currently tested feed key is:

```text
light-cmd
```

The backend publishes to the feed stored in:

```text
devices.mqtt_topic_pub
```

Verify device feed config:

```bash
docker compose exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sManager \
  -P 'Hello123@' \
  -C \
  -d smarthome \
  -Q "SELECT device_id, name, mqtt_topic_pub FROM devices ORDER BY device_id;"
```

Expected example:

```text
device_id  name              mqtt_topic_pub
1          Đèn phòng khách   light-cmd
2          Quạt phòng ngủ    light-cmd
```

To update all devices to use `light-cmd`:

```bash
docker compose exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sManager \
  -P 'Hello123@' \
  -C \
  -d smarthome \
  -Q "UPDATE devices SET mqtt_topic_pub = 'light-cmd';"
```

## Running The Backend

From the backend folder:

```bash
cd backend
node server.js
```

Use `node server.js` for now because `npm run dev` may fail if `nodemon` has permission issues.

Expected startup logs:

```text
Server running on port 5000
Schedule worker started
SQL Server (smarthome) connected successfully.
Database connected
Connected to Adafruit IO MQTT Broker
Subscribed to feeds: <ADAFRUIT_AIO_USERNAME>/feeds/+
```

If DB credentials are wrong:

```text
Login failed for user 'sManager'
```

If MQTT credentials are missing:

```text
Missing Adafruit IO credentials in environment variables.
```

## Schedule Fields

The `schedules` table currently uses:

| Field | Type | Meaning |
| --- | --- | --- |
| `schedule_id` | number | Primary key |
| `device_id` | number | Target device |
| `name` | string | Schedule display name |
| `action_type` | string | One of `turn_on`, `turn_off`, `set_level` |
| `target_value` | number/null | Optional value for actions such as `set_level` |
| `time_start` | time | Execution time, `HH:mm` or `HH:mm:ss` |
| `days_of_week` | string | Comma-separated days, `1,2,3,4,5,6,7` |
| `is_active` | boolean | Whether worker should execute this schedule |
| `last_run_at` | datetime/null | Last execution timestamp |
| `created_at` | datetime | Creation timestamp |

Day convention follows the SQL script:

```text
1 = Sunday
2 = Monday
3 = Tuesday
4 = Wednesday
5 = Thursday
6 = Friday
7 = Saturday
```

## API Endpoints

Base URL:

```text
http://localhost:5000/api
```

### Get All Schedules

```http
GET /api/schedules
```

Example:

```bash
curl http://localhost:5000/api/schedules
```

Example response:

```json
{
  "data": [
    {
      "time_start": "18:00:00",
      "schedule_id": "1",
      "device_id": "1",
      "name": "Bật đèn buổi tối",
      "action_type": "turn_on",
      "target_value": null,
      "days_of_week": "2,3,4,5,6,7",
      "is_active": true,
      "last_run_at": null,
      "created_at": "2026-04-21T19:31:03.438Z",
      "Device": {
        "device_id": "1",
        "name": "Đèn phòng khách",
        "type": "light",
        "location": "Phòng khách"
      }
    }
  ]
}
```

### Get Schedules By Device

```http
GET /api/devices/:deviceId/schedules
```

Example:

```bash
curl http://localhost:5000/api/devices/1/schedules
```

Example response:

```json
{
  "data": [
    {
      "time_start": "18:00:00",
      "schedule_id": "1",
      "device_id": "1",
      "name": "Bật đèn buổi tối",
      "action_type": "turn_on",
      "target_value": null,
      "days_of_week": "2,3,4,5,6,7",
      "is_active": true,
      "last_run_at": null,
      "created_at": "2026-04-21T19:31:03.438Z"
    }
  ]
}
```

### Create Schedule

```http
POST /api/schedules
```

Required fields:

- `device_id`
- `action_type`
- `time_start`

Optional fields:

- `name`
- `target_value`
- `days_of_week`
- `days`
- `is_active`

`days` is accepted as an alias for `days_of_week`.

Example inactive schedule for CRUD testing:

```bash
curl -X POST http://localhost:5000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": 2,
    "name": "Tắt quạt buổi đêm",
    "action_type": "turn_off",
    "time_start": "22:30",
    "days_of_week": "1,7",
    "is_active": false
  }'
```

Example response:

```json
{
  "data": {
    "time_start": "22:30:00",
    "created_at": "2026-04-22T08:09:09.705Z",
    "schedule_id": "5",
    "device_id": "2",
    "name": "Tắt quạt buổi đêm",
    "action_type": "turn_off",
    "target_value": null,
    "days_of_week": "1,7",
    "is_active": false,
    "last_run_at": null
  }
}
```

Example active schedule for runtime MQTT testing:

```bash
curl -X POST http://localhost:5000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": 1,
    "name": "Runtime MQTT smoke test",
    "action_type": "turn_on",
    "time_start": "15:45",
    "days_of_week": "4",
    "is_active": true
  }'
```

Important: create runtime test schedules for the next minute, not the current minute. If the worker tick for that minute already passed, the schedule will not run until the next matching day.

### Update Schedule

```http
PUT /api/schedules/:id
```

All fields are optional, but any provided field is validated.

Example:

```bash
curl -X PUT http://localhost:5000/api/schedules/5 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tắt quạt cuối tuần",
    "action_type": "turn_off",
    "time_start": "23:00",
    "days_of_week": "1,7",
    "is_active": true
  }'
```

Example response:

```json
{
  "data": {
    "time_start": "23:00:00",
    "schedule_id": "5",
    "device_id": "2",
    "name": "Tắt quạt cuối tuần",
    "action_type": "turn_off",
    "target_value": null,
    "days_of_week": "1,7",
    "is_active": true,
    "last_run_at": null,
    "created_at": "2026-04-22T08:09:09.705Z"
  }
}
```

### Delete Schedule

```http
DELETE /api/schedules/:id
```

Example:

```bash
curl -X DELETE http://localhost:5000/api/schedules/5
```

Example response:

```json
{
  "message": "Schedule deleted successfully"
}
```

## Validation Errors

### Device Does Not Exist

Request:

```bash
curl -X POST http://localhost:5000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": 999,
    "name": "Invalid device test",
    "action_type": "turn_on",
    "time_start": "23:58",
    "days_of_week": "1,2,3,4,5,6,7",
    "is_active": false
  }'
```

Expected response:

```json
{
  "error": "Device not found"
}
```

HTTP status:

```text
404
```

### Invalid Action

Request:

```bash
curl -X POST http://localhost:5000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": 1,
    "name": "Invalid action test",
    "action_type": "open_door",
    "time_start": "23:58",
    "days_of_week": "1"
  }'
```

Expected response:

```json
{
  "error": "action_type must be one of: turn_on, turn_off, set_level"
}
```

HTTP status:

```text
400
```

### Invalid Time

Request:

```bash
curl -X POST http://localhost:5000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": 1,
    "name": "Invalid time test",
    "action_type": "turn_on",
    "time_start": "25:99",
    "days_of_week": "1"
  }'
```

Expected response:

```json
{
  "error": "time_start must use HH:mm or HH:mm:ss format"
}
```

HTTP status:

```text
400
```

## Runtime Worker Test

### 1. Create Schedule For The Next Minute

Generate the next minute and today number:

```bash
node - <<'NODE'
const now = new Date();
now.setMinutes(now.getMinutes() + 1);

const hh = String(now.getHours()).padStart(2, "0");
const mm = String(now.getMinutes()).padStart(2, "0");
const day = String(now.getDay() + 1);

console.log(`TIME_START=${hh}:${mm}`);
console.log(`DAYS_OF_WEEK=${day}`);
NODE
```

Use the printed values:

```bash
curl -X POST http://localhost:5000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": 1,
    "name": "Runtime MQTT smoke test",
    "action_type": "turn_on",
    "time_start": "REPLACE_WITH_TIME_START",
    "days_of_week": "REPLACE_WITH_DAYS_OF_WEEK",
    "is_active": true
  }'
```

Example:

```bash
curl -X POST http://localhost:5000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": 1,
    "name": "Runtime MQTT smoke test",
    "action_type": "turn_on",
    "time_start": "15:45",
    "days_of_week": "4",
    "is_active": true
  }'
```

### 2. Expected Backend Logs

Watch the terminal running:

```bash
node server.js
```

At the scheduled minute, expected logs:

```text
Published to <ADAFRUIT_AIO_USERNAME>/feeds/light-cmd: {
  command_id: 'cmd-...',
  device_id: '1',
  command: 'turn_on',
  timestamp: '...',
  schedule_id: '...',
  source: 'schedule',
  target_value: null
}

Message received on <ADAFRUIT_AIO_USERNAME>/feeds/light-cmd:
{"command_id":"cmd-...","device_id":"1","command":"turn_on",...}

Schedule <id> executed: turn_on device 1
```

### 3. Verify Database After Runtime Execution

```bash
docker compose exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sManager \
  -P 'Hello123@' \
  -C \
  -d smarthome \
  -Q "SELECT schedule_id, device_id, action_type, time_start, days_of_week, is_active, last_run_at FROM schedules ORDER BY schedule_id DESC; SELECT device_id, name, mqtt_topic_pub, power_status, control_mode FROM devices ORDER BY device_id; SELECT TOP 10 log_id, device_id, action_type, description, created_at FROM activity_logs ORDER BY log_id DESC;"
```

Expected:

- `schedules.last_run_at` is not null for the executed schedule.
- Target device `power_status` changed to `on` or `off`.
- Target device `control_mode` changed to `schedule`.
- `activity_logs` includes a `SCHEDULE` row.
- `activity_logs` may also include a `CONTROL` row from SQL trigger `TRG_Log_Device_Changes`.

## Important Notes

### POST Does Not Publish Immediately

`POST /api/schedules` only inserts the schedule into SQL Server. It does not publish to Adafruit immediately.

MQTT publish happens only when:

- backend server is running,
- schedule worker is running,
- `is_active = true`,
- current `HH:mm` matches `time_start`,
- current day is included in `days_of_week`,
- MQTT client is connected.

### SQL Server Logs Are Not App Activity Logs

This command:

```bash
docker compose logs -f sqlserver
```

only shows SQL Server container logs, such as startup, recovery, and login errors.

To see app activity logs, query:

```bash
docker compose exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sManager \
  -P 'Hello123@' \
  -C \
  -d smarthome \
  -Q "SELECT TOP 10 * FROM activity_logs ORDER BY log_id DESC;"
```

To see runtime backend logs, watch the terminal running:

```bash
node server.js
```

### No Real Device Yet

The current backend publishes command data to Adafruit IO successfully, but no physical device or simulator is currently listening to the feed.

So the implemented flow is:

```text
schedule -> backend worker -> Adafruit feed light-cmd
```

The missing IoT side is:

```text
Adafruit feed light-cmd -> hardware/simulator -> real device action
```

For a full demo without hardware, implement an IoT simulator that subscribes to `light-cmd`, parses the JSON command, and prints or publishes simulated device status.
