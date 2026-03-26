export default function SensorCard({ title, value, unit }) {
  return (
    <div className="bg-white p-6 shadow rounded text-center">
      <h3>{title}</h3>
      <p className="text-3xl font-bold">
        {value} {unit}
      </p>
    </div>
  );
}