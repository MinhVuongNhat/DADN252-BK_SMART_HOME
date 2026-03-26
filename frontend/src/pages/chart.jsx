import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// mock data
const data = [
  { time: "0:00", temp: 25, hum: 80, light: 200 },
  { time: "1:00", temp: 24, hum: 70, light: 180 },
  { time: "2:00", temp: 23, hum: 75, light: 150 },
  { time: "3:00", temp: 26, hum: 60, light: 220 },
  { time: "4:00", temp: 28, hum: 78, light: 300 },
  { time: "5:00", temp: 30, hum: 72, light: 350 },
  { time: "6:00", temp: 32, hum: 80, light: 400 },
  { time: "7:00", temp: 33, hum: 76, light: 420 },
  { time: "8:00", temp: 34, hum: 78, light: 450 },
  { time: "9:00", temp: 36, hum: 75, light: 480 },
  { time: "10:00", temp: 38, hum: 80, light: 500 },
  { time: "11:00", temp: 39, hum: 82, light: 520 },
  { time: "12:00", temp: 41, hum: 70, light: 530 },
  { time: "13:00", temp: 42, hum: 72, light: 540 },
  { time: "14:00", temp: 40, hum: 68, light: 520 },
  { time: "15:00", temp: 39, hum: 75, light: 500 },
  { time: "16:00", temp: 37, hum: 70, light: 480 },
  { time: "17:00", temp: 35, hum: 65, light: 450 },
  { time: "18:00", temp: 34, hum: 78, light: 420 },
  { time: "19:00", temp: 33, hum: 70, light: 390 },
  { time: "20:00", temp: 32, hum: 72, light: 360 },
  { time: "21:00", temp: 30, hum: 60, light: 300 },
  { time: "22:00", temp: 28, hum: 50, light: 250 },
  { time: "23:00", temp: 26, hum: 45, light: 200 },
];

export default function ChartPage() {
  return (
    <div className="space-y-6">
      {/* ================= NHIỆT ĐỘ ================= */}
      <div className="bg-[#e9d5b5] p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-2">Nhiệt độ</h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="temp" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= ĐỘ ẨM ================= */}
      <div className="bg-[#cfe2f3] p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-2">Độ ẩm</h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="hum" stroke="red" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ================= ĐỘ SÁNG ================= */}
      <div className="bg-[#f3f1d3] p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-2">Độ sáng</h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart layout="vertical" data={data}>
            <XAxis type="number" />
            <YAxis dataKey="time" type="category" />
            <Tooltip />
            <Bar dataKey="light" fill="#facc15" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}