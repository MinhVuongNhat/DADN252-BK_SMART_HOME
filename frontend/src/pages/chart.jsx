import { useEffect, useState, useRef } from "react";
import axios from "../api/axios";
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

export default function ChartPage() {
  const [tempData, setTempData] = useState([]);
  const [humData, setHumData] = useState([]);
  const [lightData, setLightData] = useState([]);

  const socketRef = useRef(null);

  useEffect(() => {
    fetchAll();

    // 🔥 connect socket
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("sensor-data", (data) => {
      const newPoint = {
        time: new Date(data.timestamp).toLocaleTimeString(),
        value: data.value,
      };

      // ⚠️ map type
      switch (data.type) {
        case "temperature":
        case "nhietdo":
          setTempData((prev) => [...prev.slice(-20), newPoint]);
          break;
        case "humidity":
        case "doam":
          setHumData((prev) => [...prev.slice(-20), newPoint]);
          break;
        case "light":
        case "anhsang":
          setLightData((prev) => [...prev.slice(-20), newPoint]);
          break;
        default:
          break;
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const fetchAll = async () => {
    try {
      const [t, h, l] = await Promise.all([
        axios.get("dashboard/sensors/history", { params: { sensorType: "temperature" } }),
        axios.get("dashboard/sensors/history", { params: { sensorType: "humidity" } }),
        axios.get("dashboard/sensors/history", { params: { sensorType: "light" } }),
      ]);

      setTempData(formatData(t.data));
      setHumData(formatData(h.data));
      setLightData(formatData(l.data));
    } catch (err) {
      console.error(err);
    }
  };

  const formatData = (data) => {
    return data
      .slice(0, 20)
      .reverse()
      .map((item) => ({
        time: new Date(item.recorded_at).toLocaleTimeString(),
        value: item.value,
      }));
  };

  return (
    <div className="space-y-6">
      <ChartCard title="Nhiệt độ" data={tempData} color="red" bg="bg-[#e9d5b5]" />
      <ChartCard title="Độ ẩm" data={humData} color="blue" bg="bg-[#cfe2f3]" />
      <ChartCard title="Độ sáng" data={lightData} color="orange" bg="bg-[#f3f1d3]" />
    </div>
  );
}