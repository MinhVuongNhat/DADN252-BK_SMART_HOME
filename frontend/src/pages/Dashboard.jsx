import { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import socket from "../socket/socket";
import axios from "../api/axios";
import ChartPage from "./chart";

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState({ totalDevices: 0, totalSensors: 0 });
  const [sensor, setSensor] = useState({ nhietdo: 0, doam: 0, anhsang: 0 });
  // Thêm state này vào đầu function Dashboard
  const [selectedSensor, setSelectedSensor] = useState(null); 
  const [historyData, setHistoryData] = useState([]);
  const [showSensorList, setShowSensorList] = useState(false);
  const [allSensors, setAllSensors] = useState([]); // Chứa danh sách chi tiết từ getAllSensors

  const handleOpenSensorList = async () => {
    setShowSensorList(true);
    try {
      const res = await axios.get("/sensors"); // API getAllSensors Thắng vừa viết ở Backend
      setAllSensors(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách cảm biến:", err);
    }
  };

  // Hàm xử lý khi bấm vào Card
  const handleOpenHistory = async (id, title, type) => {
    setSelectedSensor({ id, title, type });
    try {
      // Gọi API lấy lịch sử (Thắng đã viết ở Backend hôm trước)
      const res = await axios.get(`/sensors/history/${type}`);
      setHistoryData(res.data);
    } catch (err) {
      console.error("Lỗi lấy lịch sử:", err);
    }
  };

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
  useEffect(() => {
    document.title = "Trang chủ | BK SmartHome";
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
              {/* Ô 1: Tổng thiết bị */}
              <StatCard title="Tổng thiết bị" value={summary.totalDevices} />
              
              {/* Ô 2: Số cảm biến - SỬA LẠI ĐOẠN NÀY */}
              <div 
                onClick={handleOpenSensorList} 
                className="w-full cursor-pointer transform transition-all hover:scale-105"
                style={{ display: 'grid' }} 
              >
                {/* Biến cái div cha thành 1 grid nhỏ, nó sẽ ép StatCard tự động phình to 100% */}
                <StatCard title="Số cảm biến" value={summary.totalSensors} />
              </div>
              
              {/* Ô 3: Đồng hồ hiển thị thời gian */}
              <TimeCard />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div onClick={() => handleOpenHistory("1", "Nhiệt độ", "temperature")} className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <SensorCard title="Nhiệt độ" value={sensor.nhietdo} unit="°C" color="text-red-500" />
              </div>
              <div onClick={() => handleOpenHistory("2", "Độ ẩm", "humidity")} className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <SensorCard title="Độ ẩm" value={sensor.doam} unit="%" color="text-blue-500" />
              </div>
              <div onClick={() => handleOpenHistory("3", "Ánh sáng", "light")} className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <SensorCard title="Ánh sáng" value={sensor.anhsang} unit="lux" color="text-yellow-500" />
              </div>
            </div>
          </>
        )}
        
        {tab === "chart" && <ChartPage />}
      </div>
      {selectedSensor && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Lịch sử: {selectedSensor.title}</h2>
        <button onClick={() => setSelectedSensor(null)} className="text-gray-500 hover:text-red-500 text-3xl">&times;</button>
      </div>

      {/* Body - Bảng dữ liệu */}
      <div className="flex-1 overflow-y-auto p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">Ngày</th>
              <th className="p-3 border">Giờ</th>
              <th className="p-3 border">Giá trị</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-3 border">
                  {new Date(item.recorded_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="p-3 border">
                  {new Date(item.recorded_at).toLocaleTimeString("vi-VN")}
                </td>
                <td className="p-3 border font-semibold text-blue-600">
                  {item.value} {selectedSensor.id === "1" ? "°C" : selectedSensor.id === "2" ? "%" : "lux"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{showSensorList && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
        <h2 className="text-2xl font-bold text-gray-800">Thông tin chi tiết các cảm biến</h2>
        <button onClick={() => setShowSensorList(false)} className="text-gray-500 hover:text-red-500 text-3xl">&times;</button>
      </div>

      {/* Body - Bảng danh sách Sensor */}
      <div className="flex-1 overflow-y-auto p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
              <th className="p-4 border">ID</th>
              <th className="p-4 border">Tên Cảm Biến</th>
              <th className="p-4 border">Loại</th>
              <th className="p-4 border">Trạng Thái</th>
              <th className="p-4 border">Cập nhật cuối</th>
            </tr>
          </thead>
          <tbody>
            {allSensors.length > 0 ? (
              allSensors.map((s) => (
                <tr key={s.sensor_id} className="hover:bg-blue-50 transition-colors">
                  <td className="p-4 border font-mono text-sm">{s.sensor_id}</td>
                  <td className="p-4 border font-semibold">{s.name}</td>
                  <td className="p-4 border text-blue-600">{s.type}</td>
                  <td className="p-4 border">
                    <span className={`px-3 py-1 rounded-full text-xs ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.status === 'active' ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="p-4 border text-gray-500 text-sm">
                    {s.last_seen ? new Date(s.last_seen).toLocaleString("vi-VN") : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-400">Đang tải dữ liệu...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}
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