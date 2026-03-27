import tempImg from "../../assets/cam-bien-nhiet-do-do-am-dht20.png";
import lightImg from "../../assets/cam-bien-anh-sang.png";

export default function SensorCard({ sensor, onDelete }) {
  const img =
    sensor.type === "temperature"
      ? tempImg
      : sensor.type === "light"
      ? lightImg
      : tempImg;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold mb-3">{sensor.name}</h3>

      <div className="flex justify-center mb-3">
        <img src={img} className="w-14 h-14" />
      </div>

      <div className="text-center text-xl mb-3">
        {sensor.value}
      </div>

      <Toggle label="Hoạt động" status={sensor.status === "active"} />

      <button
        onClick={() => onDelete(sensor.id)}
        className="mt-3 w-full bg-red-500 text-white rounded py-1"
      >
        Xóa
      </button>
    </div>
  );
}

function Toggle({ label, status, onClick }) {
  return (
    <div className="flex justify-between items-center mb-2">
      <span>{label}</span>

      <div
        onClick={onClick}
        className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition ${
          status ? "bg-blue-500 justify-end" : "bg-gray-300"
        }`}
      >
        <div className="w-5 h-5 bg-white rounded-full"></div>
      </div>
    </div>
  );
}