export const mockDevices = [
  {
    device_id: 1,
    user_id: 1,
    name: "Đèn phòng khách",
    type: "light",
    location: "Phòng khách",
    connection_status: "online",
    power_status: "on",
    control_mode: "manual",
    last_seen: "2026-03-30T10:00:00Z",
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    device_id: 2,
    user_id: 1,
    name: "Đèn phòng ngủ",
    type: "light",
    location: "Phòng ngủ",
    connection_status: "offline",
    power_status: "off",
    control_mode: "automation",
    last_seen: "2026-03-29T22:00:00Z",
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    device_id: 3,
    user_id: 1,
    name: "Quạt phòng khách",
    type: "fan",
    location: "Phòng khách",
    connection_status: "online",
    power_status: "on",
    control_mode: "automation",
    last_seen: "2026-03-30T10:00:00Z",
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    device_id: 4,
    user_id: 1,
    name: "Quạt bếp",
    type: "fan",
    location: "Bếp",
    connection_status: "online",
    power_status: "on",
    control_mode: "automation",
    last_seen: "2026-03-30T10:00:00Z",
    created_at: "2026-03-01T00:00:00Z",
  },
];

export const mockSensors = [
  {
    sensor_id: 1,
    user_id: 1,
    name: "Nhiệt độ phòng khách",
    type: "temperature",
    unit: "°C",
    status: "active",
    last_seen: "2026-03-30T10:00:00Z",
  },
  {
    sensor_id: 2,
    user_id: 1,
    name: "Độ ẩm phòng khách",
    type: "humidity",
    unit: "%",
    status: "active",
    last_seen: "2026-03-30T10:00:00Z",
  },
  {
    sensor_id: 3,
    user_id: 1,
    name: "Ánh sáng ban công",
    type: "light",
    unit: "lux",
    status: "active",
    last_seen: "2026-03-30T10:00:00Z",
  },
];

export const latestValues = [
  { sensor_id: 1, current_value: 28 },
  { sensor_id: 2, current_value: 65 },
  { sensor_id: 3, current_value: 450 },
];

export const mockRules = [
  {
    rule_id: 1,
    name: "Bật quạt khi nóng",
    is_active: true,
    priority: 1,
  },
  {
    id: 2,
    name: "Bật đèn khi tối",
    is_active: true,
    priority: 1,
  },
];

export const mockConditions = [
  {
    condition_id: 1,
    rule_id: 1,
    sensor_id: 1,
    operator: ">",
    target_value: 30,
  },
  {
    condition_id: 2,
    rule_id: 2,
    sensor_id: 3,
    operator: "<",
    target_value: 200,
  },
];

export const mockActions = [
  {
    action_id: 1,
    rule_id: 1,
    device_id: 3,
    action_type: "turn_on",
  },
  {
    action_id: 2,
    rule_id: 2,
    device_id: 2,
    action_type: "turn_on",
  },
];

export const mockLogs = [
  {
    log_id: 1,
    device_name: "Đèn phòng khách",
    action_type: "CONTROL",
    description: "Bật đèn",
    created_at: "2026-03-29 10:00",
  },
  {
    log_id: 2,
    device_name: "Quạt",
    action_type: "AUTOMATION",
    description: "Tự động bật do nhiệt độ cao",
    created_at: "2026-03-29 11:00",
  },
];

export const mockAlerts = [
  {
    alert_id: 1,
    severity: "critical",
    message: "Nhiệt độ phòng khách quá cao: 45°C",
    is_resolved: false,
    created_at: "2026-03-29 10:00",
  },
  {
    alert_id: 2,
    severity: "warning",
    message: "Độ ẩm thấp: 20%",
    is_resolved: true,
    created_at: "2026-03-29 09:00",
  },
];