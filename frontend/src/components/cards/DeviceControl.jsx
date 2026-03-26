export default function DeviceControl({ name, status, onToggle }) {
  return (
    <div className="bg-white p-6 shadow rounded">
      <h3>{name}</h3>
      <button
        onClick={onToggle}
        className={`mt-4 px-4 py-2 ${
          status ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {status ? "ON" : "OFF"}
      </button>
    </div>
  );
}