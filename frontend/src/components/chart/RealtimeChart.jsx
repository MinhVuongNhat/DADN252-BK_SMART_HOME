import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các module cần thiết của Chart.js (Đã bỏ TimeScale vì mình dùng string cho dễ)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// BẮT BUỘC: Phải nhận các biến (props) từ ChartPage truyền vào
const RealtimeChart = ({ title, data, color, bg }) => {
  
  // Dữ liệu 'data' nhận vào đang có dạng mảng: [{ time: "10:00 AM", value: 35 }, ...]
  // Mình tách nó ra thành 2 mảng riêng cho trục X (thời gian) và trục Y (giá trị)
  const labels = data && data.length > 0 ? data.map(item => item.time) : [];
  const values = data && data.length > 0 ? data.map(item => item.value) : [];

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: title,
        data: values,
        borderColor: color, // Lấy màu từ ngoài truyền vào (red, blue, orange)
        backgroundColor: color,
        tension: 0.3, // Tạo độ cong mềm mại cho đường Line
        pointRadius: 4, // Độ to của cái chấm
        pointBackgroundColor: "white",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Quan trọng: Cho phép chart co giãn theo thẻ div bọc ngoài
    animation: {
      duration: 300, // Animation mượt mà khi có data mới nhảy vào
    },
    plugins: {
      legend: {
        display: false, // Ẩn cái chú thích (Legend) đi vì mình có title rồi
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        title: { display: false }, // Có thể bật lên thành true nếu muốn hiện chữ "Thời gian"
        ticks: { 
          maxTicksLimit: 8, // Không hiển thị quá nhiều mốc thời gian kẻo chữ dính chùm vào nhau
        }
      },
      y: {
        title: { display: true, text: "Giá trị" },
        beginAtZero: false,
      },
    },
  };

  return (
    // Lấy cái màu background (bg) truyền từ ChartPage vào luôn
    <div className={`p-6 rounded-xl shadow-sm border border-gray-100 ${bg}`}>
      <h2 className="text-lg font-bold mb-4 text-gray-800 uppercase tracking-wider">{title}</h2>
      
      {/* Container bọc ngoài phải có chiều cao cụ thể thì Chart.js mới render được */}
      <div className="h-72 w-full">
        {data && data.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 italic font-medium">
            Đang tải dữ liệu biểu đồ...
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeChart;