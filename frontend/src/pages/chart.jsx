import { useEffect, useState } from "react";
import axios from "../api/axios"; // endpoint backend
import { io } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// URL socket.io của backend
const SOCKET_URL = "http://localhost:3000"; // đổi theo backend của bạn

export default function ChartPage() {
  const [tempData, setTempData] = useState([]);
  const [humData, setHumData] = useState([]);
  const [lightData, setLightData] = useState([]);

  useEffect(() => {
    fetchAll();

    const socket = io(SOCKET_URL);

    socket.on("connect", () => console.log("✅ Connected to socket.io"));

    socket.on("sensor-data", (data) => {
      const formatted = {
        time: new Date(data.timestamp).toLocaleTimeString(),
        value: data.value,
      };

      switch (data.type) {
        case "temperature":
          setTempData((prev) => updateChart(prev, formatted));
          break;
        case "humidity":
          setHumData((prev) => updateChart(prev, formatted));
          break;
        case "light":
          setLightData((prev) => updateChart(prev, formatted));
          break;
        default:
          break;
      }
    });

    return () => socket.disconnect();
  }, []);

  // Lấy lịch sử 20 điểm gần nhất
  const fetchAll = async () => {
    try {
      const [t, h, l] = await Promise.all([
        axios.get("dashboard/sensors/history", {
          params: { sensorType: "temperature" },
        }),
        axios.get("dashboard/sensors/history", {
          params: { sensorType: "humidity" },
        }),
        axios.get("dashboard/sensors/history", {
          params: { sensorType: "light" },
        }),
      ]);

      setTempData(formatData(t.data));
      setHumData(formatData(h.data));
      setLightData(formatData(l.data));
    } catch (err) {
      console.error(err);
    }
  };

  // Format data từ API
  const formatData = (data) =>
    data
      .slice(0, 20)
      .reverse()
      .map((item) => ({
        time: new Date(item.recorded_at).toLocaleTimeString(),
        value: item.value,
      }));

  // Update chart realtime, giữ tối đa 20 điểm
  const updateChart = (prevData, newPoint) => {
    const updated = [...prevData, newPoint];
    if (updated.length > 20) updated.shift();
    return updated;
  };

  return (
    <div className="space-y-6">
      <ChartCard
        title="Nhiệt độ"
        data={tempData}
        color="red"
        bg="bg-[#e9d5b5]"
      />
      <ChartCard title="Độ ẩm" data={humData} color="blue" bg="bg-[#cfe2f3]" />
      <ChartCard
        title="Độ sáng"
        data={lightData}
        color="orange"
        bg="bg-[#f3f1d3]"
      />
    </div>
  );
}

// ================= REUSABLE COMPONENT =================
function ChartCard({ title, data, color, bg }) {
  return (
    <div className={`${bg} p-4 rounded-lg shadow`}>
      <h2 className="font-semibold mb-2">{title}</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={color} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}