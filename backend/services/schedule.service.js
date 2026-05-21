const db = require("../config/db");
const { QueryTypes } = require("sequelize");

function normalizeTime(t) {
  if (!t) return null;
  if (t.length === 5) return `${t}:00`;
  return t;
}

// Lấy lịch trình theo DeviceID
exports.getSchedulesByDevice = async (deviceId) => {
  const result = await db.query(
    "SELECT * FROM schedules WHERE device_id = :deviceId",
    {
      replacements: { deviceId },
      type: QueryTypes.SELECT
    }
  );
  return result;
};

// Hàm tạo mới (để tránh lỗi is not a function)
exports.createSchedule = async (data) => {
  const { device_id, name, start_time, end_time, action_type } = data;

  const deviceIdNum = Number(device_id);
  if (isNaN(deviceIdNum)) {
    throw new Error("device_id không hợp lệ");
  }

  const sTime = normalizeTime(start_time);
  const eTime = normalizeTime(end_time);

  const result = await db.query(
    `
    INSERT INTO schedules (device_id, name, action_type, start_time, end_time, is_active)
    OUTPUT INSERTED.*
    VALUES (:device_id, :name, :action_type, :start_time, :end_time, 1)
    `,
    {
      replacements: {
        device_id: deviceIdNum,
        name: name || 'Lịch trình',
        action_type: action_type || 'turn_on',
        start_time: sTime,
        end_time: eTime
      }
    }
  );

  return result[0][0];
};

// Hàm cập nhật hoặc tạo mới (UPSERT)
exports.upsertSchedule = async (deviceId, data) => {
  const existing = await db.query(
    "SELECT schedule_id FROM schedules WHERE device_id = :deviceId",
    {
      replacements: { deviceId },
      type: QueryTypes.SELECT
    }
  );
};

// Hàm Bật/Tắt (Toggle) is_active
exports.toggleSchedule = async (deviceId, is_active) => {
  const result = await db.query(
    `
    UPDATE schedules 
    SET is_active = :is_active
    OUTPUT INSERTED.*
    WHERE device_id = :deviceId
    `,
    {
      replacements: {
        deviceId,
        is_active: is_active ? 1 : 0
      },
      type: QueryTypes.UPDATE
    }
  );
};

exports.deleteSchedule = async (id) => {
  await db.query(
    "DELETE FROM schedules WHERE schedule_id = :id",
    {
      replacements: { id },
      type: QueryTypes.DELETE
    }
  );
};