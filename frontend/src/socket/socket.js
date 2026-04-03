import { io } from "socket.io-client";
import ChartPage from "../pages/chart.jsx"
const socket = io("http://localhost:5000"); // URL backend

socket.on("connect", () => console.log("Connected to server"));

socket.on("sensor-data", (data) => {
  console.log("Realtime sensor:", data);
  // Cập nhật chart ở đây
  ChartPage.data.datasets[0].data.push(data.value);
  ChartPage.update(); // Chart.js tự render
});

export default socket;