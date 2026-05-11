const sql = require("../config/db");

/**
 * Chuẩn hoá time "HH:mm" -> "HH:mm:ss"
 */
function normalizeTime(t) {
  if (!t) return null;
  return t.length === 5 ? `${t}:00` : t;
}

/**
 * Validate business rules cơ bản
 */
function validateScheduleInput(data) {
  const {
    device_id,
    action_type,
    start_time,
    end_time,
    start_date,
    end_date
  } = data;

  if (!device_id) throw new Error("device_id is required");
  if (!action_type) throw new Error("action_type is required");
  if (!start_time || !end_time) throw new Error("start_time & end_time are required");

  if (start_time >= end_time) {
    throw new Error("start_time must be less than end_time");
  }

  if (start_date && end_date && start_date > end_date) {
    throw new Error("start_date must be <= end_date");
  }
}

/**
 * Check device tồn tại (FK fail sẽ throw nhưng check trước để trả lỗi đẹp hơn)
 */
async function ensureDeviceExists(device_id) {
  const result = await sql.query`
    SELECT device_id FROM devices WHERE device_id = ${device_id}
  `;
  if (result.recordset.length === 0) {
    throw new Error("Device not found");
  }
}

/**
 * (Optional nâng cao) Check overlap schedule
 */
async function checkOverlap(device_id, start_time, end_time, start_date, end_date, excludeId = null) {
  const result = await sql.query`
    SELECT * FROM schedules
    WHERE device_id = ${device_id}
      AND is_active = 1
      ${excludeId ? sql`AND schedule_id != ${excludeId}` : sql``}
      AND (
        (start_time < ${end_time} AND end_time > ${start_time})
      )
  `;

  if (result.recordset.length > 0) {
    throw new Error("Schedule time overlaps with existing schedule");
  }
}

/**
 * CREATE
 */
exports.createSchedule = async (data) => {
  validateScheduleInput(data);

  const {
    device_id,
    name,
    action_type,
    target_value,
    start_time,
    end_time,
    start_date,
    end_date
  } = data;

  await ensureDeviceExists(device_id);

  const sTime = normalizeTime(start_time);
  const eTime = normalizeTime(end_time);

  await checkOverlap(device_id, sTime, eTime, start_date, end_date);

  const result = await sql.query`
    INSERT INTO schedules (
      device_id,
      name,
      action_type,
      target_value,
      start_time,
      end_time,
      start_date,
      end_date,
      is_active
    )
    OUTPUT INSERTED.*
    VALUES (
      ${device_id},
      ${name || null},
      ${action_type},
      ${target_value || null},
      ${sTime},
      ${eTime},
      ${start_date || null},
      ${end_date || null},
      1
    )
  `;

  return result.recordset[0];
};

/**
 * GET by device
 */
exports.getSchedulesByDevice = async (deviceId) => {
  const result = await sql.query`
    SELECT *
    FROM schedules
    WHERE device_id = ${deviceId}
    ORDER BY created_at DESC
  `;
  return result.recordset;
};

/**
 * UPDATE
 */
exports.updateSchedule = async (id, data) => {
  const fields = [];
  const request = new sql.Request();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = @${key}`);
      request.input(key, value);
    }
  });

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  request.input("id", id);

  const query = `
    UPDATE schedules
    SET ${fields.join(", ")}
    OUTPUT INSERTED.*
    WHERE schedule_id = @id
  `;

  const result = await request.query(query);

  if (result.recordset.length === 0) {
    throw new Error("Schedule not found");
  }

  return result.recordset[0];
};

/**
 * DELETE
 */
exports.deleteSchedule = async (id) => {
  const result = await sql.query`
    DELETE FROM schedules
    OUTPUT DELETED.*
    WHERE schedule_id = ${id}
  `;

  if (result.recordset.length === 0) {
    throw new Error("Schedule not found");
  }

  return true;
};

/**
 * TOGGLE ACTIVE
 */
exports.toggleSchedule = async (id, is_active) => {
  const result = await sql.query`
    UPDATE schedules
    SET is_active = ${is_active}
    OUTPUT INSERTED.*
    WHERE schedule_id = ${id}
  `;

  if (result.recordset.length === 0) {
    throw new Error("Schedule not found");
  }

  return result.recordset[0];
};