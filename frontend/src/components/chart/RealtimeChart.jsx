import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { io } from "socket.io-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

const RealtimeChart = () => {
  const [dataPoints, setDataPoints] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // kết nối tới backend Socket.IO
    socketRef.current = io("http://localhost:5000"); // đổi port nếu cần

    // lắng nghe event realtime
    socketRef.current.on("sensor-data", (data) => {
      // cập nhật state
      setDataPoints((prev) => [
        ...prev.slice(-50), // chỉ giữ 50 điểm gần nhất
        { x: new Date(data.timestamp), y: data.value },
      ]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const chartData = {
    datasets: [
      {
        label: "Sensor Value",
        data: dataPoints,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "second",
          tooltipFormat: 'HH:mm:ss'
        },
        title: { display: true, text: "Time" },
      },
      y: {
        title: { display: true, text: "Value" },
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default RealtimeChart;
