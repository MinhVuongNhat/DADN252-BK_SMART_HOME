-- ======================================================================
-- 0. DỌN DẸP TẬN GỐC (RESET HỆ THỐNG)
-- ======================================================================
USE master;
GO

-- Bước quan trọng nhất: Ngắt toàn bộ kết nối và xóa Database
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'smarthome')
BEGIN
    -- Ép về Single User và ngắt mọi kết nối ngay lập tức
    ALTER DATABASE smarthome SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE smarthome;
    PRINT N'1. Đã xóa Database smarthome thành công.';
END
GO

-- Xóa Login ở tầng Server (nguyên nhân gây lỗi sManager already exists)
IF EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'sManager')
BEGIN
    DROP LOGIN [sManager];
    PRINT N'2. Đã xóa Login sManager thành công.';
END
GO

-- ======================================================================
-- 1. TẠO MỚI DATABASE VÀ CẤP QUYỀN
-- ======================================================================
CREATE DATABASE smarthome;
GO

USE smarthome;
GO

-- Tạo lại Login và User cho sManager
USE master;
GO
CREATE LOGIN [sManager] WITH PASSWORD = N'Nhom6251';
GO

USE smarthome;
GO
CREATE USER [sManager] FOR LOGIN [sManager];
ALTER ROLE db_owner ADD MEMBER [sManager];
PRINT N'3. Đã tạo mới Login và User sManager.';
GO
-- Sau đó mới đến đống CREATE TABLE ...
-- ======================================================================
-- TẠO BẢNG
-- ======================================================================

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
    avatar_url      NVARCHAR(255) NULL,
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
    is_processed    BIT DEFAULT 0 
);
CREATE INDEX IX_sensor_data_time ON sensor_data(sensor_id, recorded_at DESC);

-- BẢNG GIÁ TRỊ MỚI NHẤT
CREATE TABLE latest_sensor_values (
    sensor_id       BIGINT PRIMARY KEY FOREIGN KEY REFERENCES sensors(sensor_id),
    current_value   DECIMAL(12,1),
    recorded_at     DATETIMEOFFSET NOT NULL,
    updated_at      DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- AUTOMATION RULES
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
    action_type     NVARCHAR(50) NOT NULL, 
    target_value    DECIMAL(12,4),
    delay_seconds   INT DEFAULT 0
);

-- LỊCH TRÌNH
CREATE TABLE schedules (
    schedule_id     BIGINT IDENTITY(1,1) PRIMARY KEY,
    device_id       BIGINT NOT NULL FOREIGN KEY REFERENCES devices(device_id),
    name            NVARCHAR(100),
    action_type     NVARCHAR(50) NOT NULL,
    target_value    DECIMAL(12,4), -- Đã thêm cột này để SP không báo lỗi
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    start_date      DATE,
    end_date        DATE,
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
GO

-- ======================================================================
-- TRIGGERS VÀ PROCEDURES
-- ======================================================================

-- ======================================================================
-- TRIGGERS VÀ PROCEDURES (BẢN FIX LỖI SYNTAX "OR")
-- ======================================================================
USE smarthome;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_UpdateLatestValue')
    DROP TRIGGER trg_UpdateLatestValue;
GO

CREATE TRIGGER trg_UpdateLatestValue
ON sensor_data
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Tạo một bảng tạm chứa giá trị mới nhất của mỗi sensor trong đợt INSERT này
    ;WITH LatestInserted AS (
        SELECT sensor_id, value, recorded_at,
               ROW_NUMBER() OVER (PARTITION BY sensor_id ORDER BY recorded_at DESC, id DESC) as rn
        FROM inserted
    )
    MERGE INTO latest_sensor_values AS target
    USING (SELECT sensor_id, value, recorded_at FROM LatestInserted WHERE rn = 1) AS source
    ON (target.sensor_id = source.sensor_id)
    WHEN MATCHED THEN
        UPDATE SET 
            target.current_value = source.value,
            target.recorded_at = source.recorded_at,
            target.updated_at = SYSDATETIMEOFFSET()
    WHEN NOT MATCHED THEN
        INSERT (sensor_id, current_value, recorded_at, updated_at)
        VALUES (source.sensor_id, source.value, source.recorded_at, SYSDATETIMEOFFSET());
END;
GO
-- 2. FIX TRIGGER Log_Device_Changes
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TRG_Log_Device_Changes')
    DROP TRIGGER TRG_Log_Device_Changes;
GO

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

-- 3. FIX PROCEDURE Get_Sensor_Data_For_Export
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SP_Get_Sensor_Data_For_Export]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[SP_Get_Sensor_Data_For_Export];
GO

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
END;
GO 

-- 4. FIX PROCEDURE Process_Schedules
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SP_Process_Schedules]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[SP_Process_Schedules];
GO

CREATE PROCEDURE SP_Process_Schedules
AS
BEGIN
    DECLARE @CurrentTime TIME = CAST(SYSDATETIMEOFFSET() AS TIME);

    SELECT 
        s.schedule_id, 
        s.device_id, 
        s.action_type, 
        d.mqtt_topic_pub
    FROM schedules s
    JOIN devices d ON s.device_id = d.device_id
    WHERE s.is_active = 1
      AND ABS(DATEDIFF(MINUTE, s.start_time, @CurrentTime)) <= 1
      AND (s.last_run_at IS NULL OR DATEDIFF(HOUR, s.last_run_at, SYSDATETIMEOFFSET()) >= 12);

    UPDATE schedules 
    SET last_run_at = SYSDATETIMEOFFSET()
    WHERE is_active = 1 
      AND ABS(DATEDIFF(MINUTE, start_time, @CurrentTime)) <= 1;
END;
GO
-- ======================================================================
-- SAMPLE DATA
-- ======================================================================

INSERT INTO homes (home_name, address)
VALUES (N'Nhà Thông Minh BK', N'TP.HCM');

-- Sửa lại đoạn này trong file SQL của bà nha *123456
INSERT INTO users (home_id, username, password_hash, email, phone, role)
VALUES 
(1, 'admin', '$2b$10$/8JHqswWX2VJdDbQa.kXyOUtm1oEu9AQmXmpMW.k3q3jVO2tyVInW', 'admin@smarthome.com', '0900000000', 'owner'), 
(1, 'user1', '$2b$10$/8JHqswWX2VJdDbQa.kXyOUtm1oEu9AQmXmpMW.k3q3jVO2tyVInW', 'user1@smarthome.com', '0900000001', 'user');

INSERT INTO devices (user_id, name, type, location, mqtt_topic_pub, mqtt_topic_sub, connection_status, power_status, control_mode)
VALUES
(1, N'Đèn phòng khách', 'light', N'Phòng khách', 'den', 'den', 'online', 'off', 'automation'),
(1, N'Quạt phòng ngủ', 'fan', N'Phòng ngủ', 'quat','quat', 'online', 'on', 'automation');

INSERT INTO sensors (user_id, name, type, unit, mqtt_topic)
VALUES
(1, N'Cảm biến nhiệt độ', 'temperature', '°C', 'nhietdo'),
(1, N'Cảm biến độ ẩm', 'humidity', '%', 'doam'),
(1, N'Cảm biến ánh sáng', 'light', 'lux', 'anhsang');

INSERT INTO sensor_data (sensor_id, value)
VALUES
(1, 28.5), (1, 29.1), (2, 65.2), (2, 70.4), (3, 300), (3, 450);

INSERT INTO automation_rules (user_id, name)
VALUES (1, N'Tự bật quạt khi nóng');

INSERT INTO automation_conditions (rule_id, sensor_id, operator, target_value)
VALUES (1, 1, '>', 30);

INSERT INTO automation_actions (rule_id, device_id, action_type)
VALUES (1, 2, 'turn_on');

INSERT INTO schedules (device_id, name, action_type, start_time, end_time, start_date, end_date, is_active)
VALUES
(1, N'Bật đèn buổi tối', 'turn_on', '18:00', '19:00', '2026-05-01', '2026-05-01', 1);

-- LOGS
INSERT INTO activity_logs (user_id, device_id, action_type, description, created_at)
VALUES
(1, 1, 'turn on', 'no', '2026-05-01'),
(1, 1, 'turn off', 'no', '2026-05-01'),
(1, 2, 'turn on', 'no', '2026-05-01');

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

PRINT '===== ACTIVITY LOGS ====='
SELECT * FROM activity_logs;

UPDATE sensor_data SET recorded_at = DATEADD(minute, -10, SYSDATETIMEOFFSET()) WHERE value = 28.5;
UPDATE sensor_data SET recorded_at = DATEADD(minute, -5, SYSDATETIMEOFFSET()) WHERE value = 29.1;
UPDATE sensor_data SET recorded_at = DATEADD(minute, -15, SYSDATETIMEOFFSET()) WHERE value = 65.2;
UPDATE sensor_data SET recorded_at = DATEADD(minute, -8, SYSDATETIMEOFFSET()) WHERE value = 70.4;
UPDATE sensor_data SET recorded_at = DATEADD(minute, -20, SYSDATETIMEOFFSET()) WHERE value = 300;
UPDATE sensor_data SET recorded_at = DATEADD(minute, -2, SYSDATETIMEOFFSET()) WHERE value = 450;
