const cron = require("node-cron");
const scheduleService = require("../services/schedule.service");
const MQTTService = require("../services/mqtt.service");
const Device = require("../models/Device");
const socketService = require("../services/socket.service");

let started = false;
let running = false;

function currentTimeKey(date = new Date()) {
  return date.toTimeString().slice(0, 5);
}

function currentDayOfWeek(date = new Date()) {
  return String(date.getDay() + 1); // SQL script convention: Sunday = 1
}

function scheduleTimeKey(value) {
  if (!value) return "";
  if (value instanceof Date) return currentTimeKey(value);
  return String(value).slice(0, 5);
}

function scheduleRunsToday(schedule, today) {
  if (!schedule.days_of_week) return true;
  return String(schedule.days_of_week)
    .split(",")
    .map((day) => day.trim())
    .includes(today);
}

function alreadyRanThisMinute(schedule, now) {
  if (!schedule.last_run_at) return false;

  const lastRun = new Date(schedule.last_run_at);
  return (
    lastRun.getFullYear() === now.getFullYear() &&
    lastRun.getMonth() === now.getMonth() &&
    lastRun.getDate() === now.getDate() &&
    lastRun.getHours() === now.getHours() &&
    lastRun.getMinutes() === now.getMinutes()
  );
}

function statusFromAction(actionType) {
  if (actionType === "turn_on") return "on";
  if (actionType === "turn_off") return "off";
  return null;
}

async function executeDueSchedule(schedule, now) {
  const published = await MQTTService.publishDeviceCommand(
    schedule.device_id,
    schedule.action_type,
    {
      device_id: schedule.device_id,
      schedule_id: schedule.schedule_id,
      source: "schedule",
      target_value: schedule.target_value,
    },
  );

  if (!published) {
    console.warn(`Schedule ${schedule.schedule_id} skipped: MQTT publish failed`);
    return false;
  }

  const powerStatus = statusFromAction(schedule.action_type);
  if (powerStatus) {
    await Device.update(
      {
        power_status: powerStatus,
        control_mode: "schedule",
      },
      { where: { device_id: schedule.device_id } },
    );

    socketService.emitDeviceUpdate({
      device_id: schedule.device_id,
      power_status: powerStatus,
      control_mode: "schedule",
      source: "schedule",
    });
  }

  await schedule.update({ last_run_at: now });
  console.log(
    `Schedule ${schedule.schedule_id} executed: ${schedule.action_type} device ${schedule.device_id}`,
  );

  return true;
}

async function processSchedules() {
  if (running) return;
  running = true;

  try {
    const now = new Date();
    const timeKey = currentTimeKey(now);
    const today = currentDayOfWeek(now);
    const schedules = await scheduleService.getActiveSchedules();

    for (const schedule of schedules) {
      if (scheduleTimeKey(schedule.time_start) !== timeKey) continue;
      if (!scheduleRunsToday(schedule, today)) continue;
      if (alreadyRanThisMinute(schedule, now)) continue;

      await executeDueSchedule(schedule, now);
    }
  } catch (error) {
    console.error("Schedule worker error:", error);
  } finally {
    running = false;
  }
}

function start() {
  if (started) return;
  started = true;

  cron.schedule("* * * * *", processSchedules);
  console.log("Schedule worker started");
}

module.exports = {
  start,
  processSchedules,
};
