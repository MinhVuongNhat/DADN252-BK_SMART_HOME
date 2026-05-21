import { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import socket from "../socket/socket";
import axios from "../api/axios";
import ChartPage from "./chart";

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState({ totalDevices: 0, totalSensors: 0 });
  const [sensor, setSensor] = useState({ nhietdo: 0, doam: 0, anhsang: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          axios.get("/dashboard/summary"),
          axios.get("/dashboard/sensors/latest"),
        ]);

        if (results[0].status === "fulfilled") {
          setSummary(results[0].value.data);
        }

        if (results[1].status === "fulfilled") {
          const sensorObj = { nhietdo: 0, doam: 0, anhsang: 0 };
          const data = results[1].value.data;

          data.forEach((s) => {
            // Bao sân cả id lẫn sensor_id
            const sId = String(s.id || s.sensor_id);
            if (sId === "1") sensorObj.nhietdo = s.current_value;
            if (sId === "2") sensorObj.doam = s.current_value;
            if (sId === "3") sensorObj.anhsang = s.current_value;
          });
          
          console.log("Dữ liệu cảm biến mới nhất:", sensorObj);
          setSensor(sensorObj);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu dashboard:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handler = (data) => {
      setSensor((prev) => ({
        ...prev,
        [data.feed]: data.value,
      }));
    };

    socket.on("sensor_update", handler);

    return () => {
      socket.off("sensor_update", handler);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Hệ thống Giám sát</h1>

        <div className="flex gap-8 mb-8 border-b">
          <Tab active={tab === "overview"} onClick={() => setTab("overview")}>Tổng quan</Tab>
          <Tab active={tab === "chart"} onClick={() => setTab("chart")}>Biểu đồ lịch sử</Tab>
        </div>

        {tab === "overview" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <StatCard title="Tổng thiết bị" value={summary.totalDevices} />
              <StatCard title="Số cảm biến" value={summary.totalSensors} />
              <TimeCard />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <SensorCard title="Nhiệt độ" value={sensor.nhietdo} unit="°C" color="text-red-500" />
              <SensorCard title="Độ ẩm" value={sensor.doam} unit="%" color="text-blue-500" />
              <SensorCard title="Ánh sáng" value={sensor.anhsang} unit="lux" color="text-yellow-500" />
            </div>
          </>
        )}
        
        {tab === "chart" && <ChartPage />}
      </div>
    </div>
  );
}

// ================= UI COMPONENTS (Giữ nguyên bên dưới) =================
function Tab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 transition-all ${
        active ? "border-b-2 border-blue-500 text-blue-600 font-semibold" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h2 className="text-3xl font-bold text-gray-800">{value || 0}</h2>
    </div>
  );
}

function SensorCard({ title, value, unit, color }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
      <p className="text-gray-500 font-medium mb-2">{title}</p>
      <h2 className={`text-4xl font-bold ${color}`}>
        {value || 0} <span className="text-lg font-normal text-gray-400">{unit}</span>
      </h2>
    </div>
  );
}

function TimeCard() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
      <h2 className="text-3xl font-bold text-gray-800">{time.toLocaleTimeString()}</h2>
      <p className="text-gray-500 text-sm mt-1">{time.toDateString()}</p>
      <p className="text-blue-500 text-xs font-semibold uppercase mt-1">TP. Hồ Chí Minh</p>
    </div>
  );
}