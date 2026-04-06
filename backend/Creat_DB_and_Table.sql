-- ======================================================================
-- 0. TẠO DATABASE
-- ======================================================================
USE master;
GO

-- Kiểm tra nếu database tồn tại thì xóa đi để tạo mới (tránh lỗi conflict dữ liệu cũ)
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'smarthome')
BEGIN
    -- Đưa về chế độ Single User để kick hết kết nối cũ ra trước khi drop
    ALTER DATABASE smarthome SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE smarthome;
END
GO

-- Tạo lại database mới
CREATE DATABASE smarthome;
GO

-- ======================================================================
-- 1. DROP LOGIN VÀ USER NẾU TỒN TẠI
-- ======================================================================
USE smarthome;
GO

-- Xóa database user nếu tồn tại
IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'sManager')
BEGIN
    DROP USER [sManager];
    PRINT N'Database user sManager đã bị xóa.';
END
GO

USE master;
GO

-- Xóa login nếu tồn tại
IF EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'sManager')
BEGIN
    DROP LOGIN [sManager];
    PRINT N'Login sManager đã bị xóa.';
END
GO

-- ======================================================================
-- 2. TẠO LẠI LOGIN VÀ DATABASE USER
-- ======================================================================
-- Tạo login mới
CREATE LOGIN [sManager] WITH PASSWORD = N'Nhom6251';
PRINT N'Login sManager đã được tạo.';
GO

-- Tạo database user
USE smarthome;
GO

CREATE USER [sManager] FOR LOGIN [sManager];
PRINT N'Database user sManager đã được tạo.';
GO

-- Gán quyền db_owner
ALTER ROLE db_owner ADD MEMBER [sManager];
PRINT N'Đã gán quyền db_owner cho sManager.';
GO


-- NHÀ
CREATE TABLE homes (
    home_id      BIGINT IDENTITY(1,1) PRIMARY KEY,
    home_name    NVARCHAR(100) NOT NULL,
    address      NVARCHAR(255) NULL,
    created_at   DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

-- NGƯỜI DÙNG
CREATE TABLE users (
    user_id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    home_id         BIGINT NULL FOREIGN KEY REFERENCES homes(home_id) ON DELETE SET NULL,
    avatar_url NVARCHAR(255) NULL,
    username        NVARCHAR(50) NOT NULL UNIQUE,
    password_hash   NVARCHAR(255) NOT NULL,
    email           NVARCHAR(100) UNIQUE,
    phone           NVARCHAR(20),
    role            NVARCHAR(20) NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'user')),
    status          NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at      DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- THIẾT BỊ
CREATE TABLE devices (
    device_id       BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT NOT NULL FOREIGN KEY REFERENCES users(user_id),
    name            NVARCHAR(100) NOT NULL,
    type            NVARCHAR(50) NOT NULL, -- light, fan
    location        NVARCHAR(100),
    mqtt_topic_sub  NVARCHAR(200),
    mqtt_topic_pub  NVARCHAR(200),
    connection_status NVARCHAR(20) DEFAULT 'offline' CHECK (connection_status IN ('online', 'offline')),
    power_status    NVARCHAR(20) DEFAULT 'off' CHECK (power_status IN ('on', 'off')),
    last_seen       DATETIMEOFFSET,
    control_mode    NVARCHAR(20) DEFAULT 'manual' CHECK (control_mode IN ('manual', 'schedule', 'automation')),
    created_at      DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- CẢM BIẾN
CREATE TABLE sensors (
    sensor_id       BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT NOT NULL FOREIGN KEY REFERENCES users(user_id),
    name            NVARCHAR(100),
    type            NVARCHAR(50) NOT NULL, -- temperature, humidity, light
    unit            NVARCHAR(20),
    mqtt_topic      NVARCHAR(200),
    status          NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_seen       DATETIMEOFFSET,
    created_at      DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- DỮ LIỆU CẢM BIẾN (TIME-SERIES)
CREATE TABLE sensor_data (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    sensor_id       BIGINT NOT NULL FOREIGN KEY REFERENCES sensors(sensor_id),
    value           DECIMAL(12,1) NOT NULL,
    recorded_at     DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    is_processed    BIT DEFAULT 0 -- Dùng cho Automation Worker check
);
CREATE INDEX IX_sensor_data_time ON sensor_data(sensor_id, recorded_at DESC);

-- BẢNG GIÁ TRỊ MỚI NHẤT (Cho Real-time Dashboard)
CREATE TABLE latest_sensor_values (
    sensor_id       BIGINT PRIMARY KEY FOREIGN KEY REFERENCES sensors(sensor_id),
    current_value   DECIMAL(12,1),
    recorded_at     DATETIMEOFFSET NOT NULL,
    updated_at      DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- AUTOMATION RULES (Dạng: Nếu ... Thì ...)
CREATE TABLE automation_rules (
    rule_id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT NOT NULL FOREIGN KEY REFERENCES users(user_id),
    name            NVARCHAR(150) NOT NULL,
    is_active       BIT DEFAULT 1,
    priority        INT DEFAULT 10,
    created_at      DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE automation_conditions (
    condition_id    BIGINT IDENTITY(1,1) PRIMARY KEY,
    rule_id         BIGINT NOT NULL FOREIGN KEY REFERENCES automation_rules(rule_id) ON DELETE CASCADE,
    sensor_id       BIGINT NOT NULL FOREIGN KEY REFERENCES sensors(sensor_id),
    operator        NVARCHAR(10) NOT NULL CHECK (operator IN ('>', '<', '>=', '<=', '=', '!=')),
    target_value    DECIMAL(12,4),
    duration_sec    INT DEFAULT 0
);

CREATE TABLE automation_actions (
    action_id       BIGINT IDENTITY(1,1) PRIMARY KEY,
    rule_id         BIGINT NOT NULL FOREIGN KEY REFERENCES automation_rules(rule_id) ON DELETE CASCADE,
    device_id       BIGINT NOT NULL FOREIGN KEY REFERENCES devices(device_id),
    action_type     NVARCHAR(50) NOT NULL, -- turn_on, turn_off, set_level
    target_value    DECIMAL(12,4),
    delay_seconds   INT DEFAULT 0
);

-- LỊCH TRÌNH
CREATE TABLE schedules (
    schedule_id     BIGINT IDENTITY(1,1) PRIMARY KEY,
    device_id       BIGINT NOT NULL FOREIGN KEY REFERENCES devices(device_id),
    name            NVARCHAR(100),
    action_type     NVARCHAR(50) NOT NULL,
    target_value    DECIMAL(12,4),
    time_start      TIME NOT NULL,
    days_of_week    NVARCHAR(50), -- '1,2,3,4,5,6,7' (CN là 1)
    is_active       BIT DEFAULT 1,
    last_run_at     DATETIMEOFFSET,
    created_at      DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- LOGS
CREATE TABLE activity_logs (
    log_id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT NULL,
    device_id       BIGINT NULL,
    action_type     NVARCHAR(50),
    description     NVARCHAR(MAX),
    created_at      DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);
-- ALERTS
CREATE TABLE alerts (
    alert_id        BIGINT IDENTITY(1,1) PRIMARY KEY,
    sensor_id       BIGINT NOT NULL FOREIGN KEY REFERENCES sensors(sensor_id),
    severity        NVARCHAR(20) DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    message         NVARCHAR(MAX) NOT NULL,
    is_resolved     BIT DEFAULT 0,
    created_at      DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);
GO

-- TRIGGER TỰ ĐỘNG CẬP NHẬT LATEST VALUE
CREATE OR ALTER TRIGGER TRG_Sync_Latest_Sensor_Value
ON sensor_data
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    MERGE latest_sensor_values AS target
    USING (
        SELECT sensor_id, MAX(recorded_at) AS recorded_at, MAX(value) AS value
        FROM inserted
        GROUP BY sensor_id
    ) AS source
    ON target.sensor_id = source.sensor_id

    WHEN MATCHED THEN
        UPDATE SET 
            current_value = source.value,
            recorded_at = source.recorded_at,
            updated_at = SYSDATETIMEOFFSET()

    WHEN NOT MATCHED THEN
        INSERT (sensor_id, current_value, recorded_at)
        VALUES (source.sensor_id, source.value, source.recorded_at);
END;
GO
-- TRIGGER TỰ ĐỘNG HÓA LOG
CREATE TRIGGER TRG_Log_Device_Changes
ON devices
AFTER UPDATE
AS
BEGIN
    IF UPDATE(power_status)
    BEGIN
        INSERT INTO activity_logs (user_id, device_id, action_type, description)
        SELECT 
            i.user_id, 
            i.device_id, 
            'CONTROL', 
            N'Thiết bị ' + i.name + N' thay đổi trạng thái thành: ' + i.power_status
        FROM inserted i;
    END
END;
GO

-- FUNCTION ĐỊNH DẠNG DỮ LIỆU TỪ FILE CSV
CREATE PROCEDURE SP_Get_Sensor_Data_For_Export
    @SensorID BIGINT,
    @FromDate DATETIMEOFFSET,
    @ToDate DATETIMEOFFSET
AS
BEGIN
    SELECT 
        UPPER(REPLACE(CAST(NEWID() AS NVARCHAR(50)), '-', '')) AS id,
        sd.value,
        sd.sensor_id AS feed_id,
        FORMAT(sd.recorded_at, 'yyyy-MM-dd HH:mm:ss') + ' UTC' AS created_at
    FROM sensor_data sd
    WHERE sd.sensor_id = @SensorID 
      AND sd.recorded_at BETWEEN @FromDate AND @ToDate
END

GO 

-- PROCEDURE KIỂM TRA VÀ THỰC THI LỊCH TRÌNH
CREATE PROCEDURE SP_Process_Schedules
AS
BEGIN
    DECLARE @CurrentTime TIME = CAST(SYSDATETIMEOFFSET() AS TIME);
    DECLARE @Today INT = DATEPART(DW, SYSDATETIMEOFFSET()); -- 1: CN, 2: Thứ 2...

    -- Tìm các lịch trình khớp giờ và ngày, chưa chạy trong chu kỳ này
    SELECT 
        s.schedule_id, 
        s.device_id, 
        s.action_type, 
        s.target_value,
        d.mqtt_topic_pub
    FROM schedules s
    JOIN devices d ON s.device_id = d.device_id
    WHERE s.is_active = 1
      AND ABS(DATEDIFF(MINUTE, s.time_start, @CurrentTime)) <= 1
      AND (s.days_of_week LIKE '%' + CAST(@Today AS NVARCHAR) + '%')
      AND (s.last_run_at IS NULL OR DATEDIFF(HOUR, s.last_run_at, SYSDATETIMEOFFSET()) >= 12);

    -- Cập nhật thời gian chạy cuối để tránh lặp lại trong cùng 1 phút
    UPDATE schedules 
    SET last_run_at = SYSDATETIMEOFFSET()
    WHERE is_active = 1 
      AND ABS(DATEDIFF(MINUTE, time_start, @CurrentTime)) <= 1;
END;
GO

-- ======================================================================
-- SAMPLE DATA
-- ======================================================================

-- HOME
INSERT INTO homes (home_name, address)
VALUES (N'Nhà Thông Minh BK', N'TP.HCM');

-- USER
INSERT INTO users (home_id, username, password_hash, email, phone, role)
VALUES 
(1, 'admin', '$2b$10$KbQiVq6FhM9N0zjXh7p9Yu2G6Xk2HnY4p1Gv6h6Q8mT4r8yZx8cGm', 'admin@smarthome.com', '0900000000', 'owner'), -- ⭐ SỬA: bcrypt hash cho 123456
(1, 'user1', '$2b$10$KbQiVq6FhM9N0zjXh7p9Yu2G6Xk2HnY4p1Gv6h6Q8mT4r8yZx8cGm', 'user1@smarthome.com', '0900000001', 'user'); -- ⭐ SỬA: bcrypt hash
-- DEVICES
INSERT INTO devices (user_id, name, type, location, mqtt_topic_pub, mqtt_topic_sub, connection_status, power_status)
VALUES
(1, N'Đèn phòng khách', 'light', N'Phòng khách', 'home/light1/set', 'home/light1/status', 'online', 'off'),
(1, N'Quạt phòng ngủ', 'fan', N'Phòng ngủ', 'home/fan1/set', 'home/fan1/status', 'online', 'on');

-- SENSORS
INSERT INTO sensors (user_id, name, type, unit, mqtt_topic)
VALUES
(1, N'Cảm biến nhiệt độ', 'temperature', '°C', 'home/temp1'),
(1, N'Cảm biến độ ẩm', 'humidity', '%', 'home/humidity1'),
(1, N'Cảm biến ánh sáng', 'light', 'lux', 'home/light_sensor');

-- SENSOR DATA
INSERT INTO sensor_data (sensor_id, value)
VALUES
(1, 28.5),
(1, 29.1),
(2, 65.2),
(2, 70.4),
(3, 300),
(3, 450);


-- AUTOMATION RULE
INSERT INTO automation_rules (user_id, name)
VALUES
(1, N'Tự bật quạt khi nóng');

-- AUTOMATION CONDITION
INSERT INTO automation_conditions (rule_id, sensor_id, operator, target_value)
VALUES
(1, 1, '>', 30);

-- AUTOMATION ACTION
INSERT INTO automation_actions (rule_id, device_id, action_type)
VALUES
(1, 2, 'turn_on');

-- SCHEDULE
INSERT INTO schedules (device_id, name, action_type, time_start, days_of_week)
VALUES
(1, N'Bật đèn buổi tối', 'turn_on', '18:00', '2,3,4,5,6,7');

-- ALERT
INSERT INTO alerts (sensor_id, severity, message)
VALUES
(1, 'warning', N'Nhiệt độ cao');

-- ======================================================================
-- SHOW DATA
-- ======================================================================

PRINT '===== HOMES ====='
SELECT * FROM homes;

PRINT '===== USERS ====='
SELECT * FROM users;

PRINT '===== DEVICES ====='
SELECT * FROM devices;

PRINT '===== SENSORS ====='
SELECT * FROM sensors;

PRINT '===== SENSOR DATA ====='
SELECT * FROM sensor_data;

PRINT '===== LATEST SENSOR VALUES ====='
SELECT * FROM latest_sensor_values;

PRINT '===== AUTOMATION RULES ====='
SELECT * FROM automation_rules;

PRINT '===== AUTOMATION CONDITIONS ====='
SELECT * FROM automation_conditions;

PRINT '===== AUTOMATION ACTIONS ====='
SELECT * FROM automation_actions;

PRINT '===== SCHEDULES ====='
SELECT * FROM schedules;

PRINT '===== ALERTS ====='
SELECT * FROM alerts;

PRINT '===== ACTIVITY LOGS ====='
SELECT * FROM activity_logs;


UPDATE sensors SET mqtt_topic='nhietdo' WHERE type='temperature';
UPDATE sensors SET mqtt_topic='doam' WHERE type='humidity';
UPDATE sensors SET mqtt_topic='anhsang' WHERE type='light';
