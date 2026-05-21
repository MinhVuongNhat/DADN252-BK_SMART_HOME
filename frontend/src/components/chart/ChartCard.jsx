import RealtimeChart from "./RealtimeChart";

const ChartCard = ({ title, data, color, bg }) => {
  return (
    <div className={`p-4 rounded-xl shadow ${bg}`}>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <RealtimeChart data={data} color={color} />
    </div>
  );
};

export default ChartCard;