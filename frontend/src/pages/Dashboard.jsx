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
    // Đưa fetchData vào trong useEffect
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
          results[1].value.data.forEach((s) => {
            // Dùng String(s.id) để đảm bảo so sánh chuỗi với chuỗi
            if (String(s.id) === "1") sensorObj.nhietdo = s.current_value;
            if (String(s.id) === "2") sensorObj.doam = s.current_value;
            if (String(s.id) === "3") sensorObj.anhsang = s.current_value;
          });
          setSensor(sensorObj);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
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

// ================= UI COMPONENT =================

function Tab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 ${
        active ? "border-b-2 border-blue-500 text-blue-600 font-semibold" : ""
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold">{value || 0}</h2>
    </div>
  );
}

function SensorCard({ title, value, unit, color }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
      <p className="text-gray-500 mb-2">{title}</p>
      <h2 className={`text-4xl font-bold ${color}`}>
        {value || 0} {unit}
      </h2>
    </div>
  );
}

function TimeCard() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer); // Nhớ clear interval để tránh memory leak
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
      <h2 className="text-3xl font-bold">
        {time.toLocaleTimeString()}
      </h2>
      <p>{time.toDateString()}</p>
      <p>TP. Hồ Chí Minh</p>
    </div>
  );
}

