import tempImg from "../../assets/cam-bien-nhiet-do-do-am-dht20.png";
import lightImg from "../../assets/cam-bien-anh-sang.png";

// Thêm onToggle vào props
export default function SensorCard({ sensor, onDelete, onToggle }) {
  // Đồng nhất loại sensor: dht20 hoặc temperature đều dùng tempImg
  const img =
    sensor.type === "temperature" || sensor.type === "dht20"
      ? tempImg
      : sensor.type === "light"
      ? lightImg
      : tempImg;

  // Đảm bảo dùng đúng ID (sensor_id) để xóa và toggle
  const sId = sensor.sensor_id || sensor.id;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="font-semibold mb-3">{sensor.name}</h3>

        <div className="flex justify-center mb-3">
          <img src={img} className="w-14 h-14 object-contain" alt="sensor" />
        </div>

        <div className="text-center text-2xl font-bold mb-3 text-blue-600">
          {sensor.value} <span className="text-sm font-normal text-gray-500">{sensor.unit}</span>
        </div>
      </div>

      <div>
        {/* QUAN TRỌNG: Phải truyền onClick cho Toggle */}
        <Toggle 
          label="Hoạt động" 
          status={sensor.status === "active"} 
          onClick={() => onToggle(sId)} 
        />

        <button
          onClick={() => onDelete(sId)}
          className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white rounded py-1.5 transition-colors"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}

// Component Toggle con
function Toggle({ label, status, onClick }) {
  return (
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm text-gray-600">{label}</span>

      <div
        onClick={(e) => {
          e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài card
          onClick();
        }}
        className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-all duration-300 ${
          status ? "bg-blue-500 justify-end" : "bg-gray-300 justify-start"
        }`}
      >
        <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
      </div>
    </div>
  );
}