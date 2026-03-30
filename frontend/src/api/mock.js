export const mockDevices = [
  {
    id: 1,
    name: "Đèn 01",
    type: "light",
    power_status: "on",
    control_mode: "manual",
  },
  {
    id: 2,
    name: "Đèn 02",
    type: "light",
    power_status: "off",
    control_mode: "automation",
  },
  {
    id: 3,
    name: "Quạt 01",
    type: "fan",
    power_status: "on",
    control_mode: "automation",
  },
  {
    id: 4,
    name: "Quạt 02",
    type: "fan",
    power_status: "off",
    control_mode: "manual",
  },
];

export const mockSensors = [
  {
    id: 1,
    name: "Nhiệt độ phòng khách",
    type: "temperature",
    value: 28,
    status: "active",
  },
  {
    id: 2,
    name: "Độ ẩm phòng khách",
    type: "humidity",
    value: 65,
    status: "active",
  },
  {
    id: 3,
    name: "Ánh sáng ban công",
    type: "light",
    value: 450,
    status: "active",
  },
];

export const mockRules = [
  {
    id: 1,
    name: "Bật quạt khi nóng",
    is_active: true,
    condition: "Nhiệt độ > 30",
    action: "Bật quạt",
  },
  {
    id: 2,
    name: "Bật đèn khi tối",
    is_active: true,
    condition: "Ánh sáng < 100",
    action: "Bật đèn",
  },
];