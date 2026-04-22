const { Schedule, Device } = require("../models");

const ALLOWED_ACTIONS = new Set(["turn_on", "turn_off", "set_level"]);

function normalizeDays(days) {
  if (Array.isArray(days)) {
    return days.map(String).join(",");
  }

  if (typeof days === "string") {
    return days;
  }

  return null;
}

function normalizeSchedulePayload(payload) {
  const daysOfWeek = payload.days_of_week ?? payload.days;

  return {
    device_id: payload.device_id,
    name: payload.name ?? null,
    action_type: payload.action_type,
    target_value: payload.target_value ?? null,
    time_start: payload.time_start,
    days_of_week: normalizeDays(daysOfWeek),
    is_active: payload.is_active ?? true,
  };
}

function validateSchedulePayload(payload, { partial = false } = {}) {
  const errors = [];

  if (!partial || payload.device_id !== undefined) {
    if (!payload.device_id) errors.push("device_id is required");
  }

  if (!partial || payload.action_type !== undefined) {
    if (!payload.action_type) {
      errors.push("action_type is required");
    } else if (!ALLOWED_ACTIONS.has(payload.action_type)) {
      errors.push("action_type must be one of: turn_on, turn_off, set_level");
    }
  }

  if (!partial || payload.time_start !== undefined) {
    if (!payload.time_start) {
      errors.push("time_start is required");
    } else if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(payload.time_start)) {
      errors.push("time_start must use HH:mm or HH:mm:ss format");
    }
  }

  const days = payload.days_of_week ?? payload.days;
  if ((!partial || days !== undefined) && days) {
    const values = Array.isArray(days) ? days.map(String) : String(days).split(",");
    const invalidDay = values.some((value) => {
      const trimmed = value.trim();
      return !/^[1-7]$/.test(trimmed);
    });

    if (invalidDay) {
      errors.push("days_of_week must contain values from 1 to 7");
    }
  }

  return errors;
}

exports.listSchedules = async () => {
  return Schedule.findAll({
    include: [{ model: Device, attributes: ["device_id", "name", "type", "location"] }],
    order: [["schedule_id", "ASC"]],
  });
};

exports.listSchedulesByDevice = async (deviceId) => {
  return Schedule.findAll({
    where: { device_id: deviceId },
    order: [["time_start", "ASC"], ["schedule_id", "ASC"]],
  });
};

exports.createSchedule = async (payload) => {
  const normalized = normalizeSchedulePayload(payload);
  const errors = validateSchedulePayload(normalized);
  if (errors.length) {
    const error = new Error(errors.join("; "));
    error.status = 400;
    throw error;
  }

  const device = await Device.findByPk(normalized.device_id);
  if (!device) {
    const error = new Error("Device not found");
    error.status = 404;
    throw error;
  }

  return Schedule.create(normalized);
};

exports.updateSchedule = async (scheduleId, payload) => {
  const schedule = await Schedule.findByPk(scheduleId);
  if (!schedule) {
    const error = new Error("Schedule not found");
    error.status = 404;
    throw error;
  }

  const normalized = normalizeSchedulePayload({ ...schedule.toJSON(), ...payload });
  const errors = validateSchedulePayload(payload, { partial: true });
  if (errors.length) {
    const error = new Error(errors.join("; "));
    error.status = 400;
    throw error;
  }

  if (payload.device_id !== undefined) {
    const device = await Device.findByPk(payload.device_id);
    if (!device) {
      const error = new Error("Device not found");
      error.status = 404;
      throw error;
    }
  }

  await schedule.update(normalized);
  return schedule;
};

exports.deleteSchedule = async (scheduleId) => {
  const schedule = await Schedule.findByPk(scheduleId);
  if (!schedule) {
    const error = new Error("Schedule not found");
    error.status = 404;
    throw error;
  }

  await schedule.destroy();
  return { message: "Schedule deleted successfully" };
};

exports.getActiveSchedules = async () => {
  return Schedule.findAll({
    where: { is_active: true },
    include: [{ model: Device }],
    order: [["schedule_id", "ASC"]],
  });
};
