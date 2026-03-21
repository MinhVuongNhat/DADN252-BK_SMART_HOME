-- TẠO DATABASE
USE master;
GO
IF DB_ID('smarthome') IS NOT NULL
BEGIN
    ALTER DATABASE smarthome SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE smarthome;
END
GO
CREATE DATABASE smarthome;
GO
USE smarthome;
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
    value           DECIMAL(12,4) NOT NULL,
    recorded_at     DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    is_processed    BIT DEFAULT 0 -- Dùng cho Automation Worker check
);
CREATE INDEX IX_sensor_data_time ON sensor_data(sensor_id, recorded_at DESC);

-- BẢNG GIÁ TRỊ MỚI NHẤT (Cho Real-time Dashboard)
CREATE TABLE latest_sensor_values (
    sensor_id       BIGINT PRIMARY KEY FOREIGN KEY REFERENCES sensors(sensor_id),
    current_value   DECIMAL(12,4),
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
CREATE TRIGGER TRG_Sync_Latest_Sensor_Value
ON sensor_data
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    MERGE latest_sensor_values AS target
    USING (SELECT sensor_id, value, recorded_at FROM inserted) AS source
    ON (target.sensor_id = source.sensor_id)
    WHEN MATCHED THEN
        UPDATE SET current_value = source.value, recorded_at = source.recorded_at, updated_at = SYSDATETIMEOFFSET()
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
CREATE FUNCTION FN_Get_Sensor_Data_For_Export (
    @SensorID BIGINT,
    @FromDate DATETIMEOFFSET,
    @ToDate DATETIMEOFFSET
)
RETURNS TABLE
AS
RETURN (
    SELECT 
        -- Tạo mã ID giả lập hoặc dùng ID gốc (Dạng chuỗi như mẫu của bạn)
        UPPER(REPLACE(CAST(NEWID() AS NVARCHAR(50)), '-', '')) AS [id], 
        sd.value AS [value],
        sd.sensor_id AS [feed_id], -- Map sensor_id sang feed_id
        FORMAT(sd.recorded_at, 'yyyy-MM-dd HH:mm:ss') + ' UTC' AS [created_at]
    FROM sensor_data sd
    WHERE sd.sensor_id = @SensorID 
      AND sd.recorded_at BETWEEN @FromDate AND @ToDate
);
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