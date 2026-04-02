import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ChartPage() {
  const [tempData, setTempData] = useState([]);
  const [humData, setHumData] = useState([]);
  const [lightData, setLightData] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [t, h, l] = await Promise.all([
        axios.get("/sensors/history", { params: { sensorType: "temperature" } }),
        axios.get("/sensors/history", { params: { sensorType: "humidity" } }),
        axios.get("/sensors/history", { params: { sensorType: "light" } }),
      ]);

      setTempData(formatData(t.data));
      setHumData(formatData(h.data));
      setLightData(formatData(l.data));
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 convert API → chart format
  const formatData = (data) => {
    return data
      .slice(0, 20) // lấy 20 điểm gần nhất
      .reverse() // để thời gian tăng dần
      .map((item) => ({
        time: new Date(item.recorded_at).toLocaleTimeString(),
        value: item.value,
      }));
  };

  return (
    <div className="space-y-6">
      {/* ================= NHIỆT ĐỘ ================= */}
      <ChartCard
        title="Nhiệt độ"
        data={tempData}
        color="red"
        bg="bg-[#e9d5b5]"
      />

      {/* ================= ĐỘ ẨM ================= */}
      <ChartCard
        title="Độ ẩm"
        data={humData}
        color="blue"
        bg="bg-[#cfe2f3]"
      />

      {/* ================= ĐỘ SÁNG ================= */}
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