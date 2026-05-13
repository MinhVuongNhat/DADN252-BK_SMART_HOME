const db = require("../config/db");

/**
 * Chuẩn hoá time "HH:mm" -> "HH:mm:ss"
 */
function normalizeTime(t) {
  if (!t) return null;
  if (t.length === 5) return `${t}:00`;
  return t;
}

/**
 * Validate business rules
 */
function validateScheduleInput(data) {
  const { start_time, end_time } = data;
  if (!start_time || !end_time) throw new Error("Giờ bắt đầu và kết thúc là bắt buộc");

  const s = normalizeTime(start_time);
  const e = normalizeTime(end_time);

  if (s >= e) {
    throw new Error("Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
  }
  return { sTime: s, eTime: e };
}

/**
 * UPSERT: Tự động cập nhật hoặc tạo mới lịch trình cho 1 thiết bị
 * Dùng cho trường hợp lưu từ Modal thiết bị
 */
exports.upsertDeviceSchedule = async (deviceId, data) => {
  const { sTime, eTime } = validateScheduleInput(data);
  const { name, action_type, target_value } = data;

  // Kiểm tra xem thiết bị đã có schedule chưa
  const existing = await db.query`
    SELECT schedule_id FROM schedules WHERE device_id = ${deviceId}
  `;

  if (existing.recordset.length > 0) {
    // UPDATE
    const id = existing.recordset[0].schedule_id;
    return await this.updateSchedule(id, {
      start_time: sTime,
      end_time: eTime,
      name: name || "Lịch trình mặc định",
      is_active: 1
    });
  } else {
    // CREATE NEW
    const result = await db.query`
      INSERT INTO schedules (device_id, name, action_type, start_time, end_time, is_active)
      OUTPUT INSERTED.*
      VALUES (${deviceId}, ${name || 'Lịch trình'}, ${action_type || 'toggle'}, ${sTime}, ${eTime}, 1)
    `;
    return result.recordset[0];
  }
};

/**
 * GET by device
 */
exports.getSchedulesByDevice = async (deviceId) => {
  const result = await db.query`
    SELECT * FROM schedules WHERE device_id = ${deviceId}
  `;
  return result.recordset;
};

/**
 * UPDATE (Đã tối ưu lại query)
 */
exports.updateSchedule = async (id, data) => {
  // Lấy dữ liệu cũ để tránh mất data khi update partial
  const sTime = data.start_time ? normalizeTime(data.start_time) : undefined;
  const eTime = data.end_time ? normalizeTime(data.end_time) : undefined;

  const result = await db.query`
    UPDATE schedules
    SET 
      name = ISNULL(${data.name}, name),
      start_time = ISNULL(${sTime}, start_time),
      end_time = ISNULL(${eTime}, end_time),
      is_active = ISNULL(${data.is_active}, is_active)
    OUTPUT INSERTED.*
    WHERE schedule_id = ${id}
  `;

  if (result.recordset.length === 0) throw new Error("Không tìm thấy lịch trình");
  return result.recordset[0];
};

/**
 * DELETE
 */
exports.deleteSchedule = async (id) => {
  const result = await db.query`
    DELETE FROM schedules OUTPUT DELETED.* WHERE schedule_id = ${id}
  `;
  if (result.recordset.length === 0) throw new Error("Không tìm thấy lịch trình");
  return true;
};