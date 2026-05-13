import { useEffect, useState } from "react";
import axios from "../api/axios"; 
import socket from "../socket/socket"; 
import RealtimeChart from "../components/chart/RealtimeChart";

// 1. Đưa các hàm Pure Function ra ngoài Component để tránh re-render và lỗi hoisted
const formatData = (data) => {
  return data
    .slice(0, 20)
    .reverse() 
    .map((item) => ({
      time: new Date(item.recorded_at).toLocaleTimeString(),
      value: item.value,
    }));
};

const updateChart = (prevData, newPoint) => {
  const updated = [...prevData, newPoint];
  if (updated.length > 20) updated.shift();
  return updated;
};

export default function ChartPage() {
  const [tempData, setTempData] = useState([]);
  const [humData, setHumData] = useState([]);
  const [lightData, setLightData] = useState([]);

  useEffect(() => {
    // 2. Định nghĩa hàm fetchAll bên trong useEffect để tránh lỗi dependency
    const fetchAll = async () => {
      try {
        const [t, h, l] = await Promise.all([
          axios.get("/dashboard/history/1"), 
          axios.get("/dashboard/history/2"), 
          axios.get("/dashboard/history/3"), 
        ]);

        setTempData(formatData(t.data));
        setHumData(formatData(h.data));
        setLightData(formatData(l.data));
      } catch (err) {
        console.error("Lỗi lấy lịch sử Chart:", err);
      }
    };

    // Gọi hàm ngay sau khi định nghĩa
    fetchAll();

    // Lắng nghe socket
    const handleSensorUpdate = (data) => {
      const newPoint = {
        time: new Date(data.timestamp).toLocaleTimeString(),
        value: data.value,
      };

      if (data.feed === "nhietdo") {
        setTempData((prev) => updateChart(prev, newPoint));
      } else if (data.feed === "doam") {
        setHumData((prev) => updateChart(prev, newPoint));
      } else if (data.feed === "anhsang") {
        setLightData((prev) => updateChart(prev, newPoint));
      }
    };

    socket.on("sensor_update", handleSensorUpdate);

    return () => {
      socket.off("sensor_update", handleSensorUpdate); 
    };
  }, []); // Array rỗng sạch sẽ, không còn warning missing dependency

  return (
    <div className="space-y-6">
      <RealtimeChart title="Nhiệt độ" data={tempData} color="red" bg="bg-[#e9d5b5]" />
      <RealtimeChart title="Độ ẩm" data={humData} color="blue" bg="bg-[#cfe2f3]" />
      <RealtimeChart title="Độ sáng" data={lightData} color="orange" bg="bg-[#f3f1d3]" />
    </div>
  );
}