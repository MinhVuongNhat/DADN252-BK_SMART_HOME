import { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import { getLogs, getAlerts, resolveAlert } from "../api/log.api";
import { mockLogs, mockAlerts } from "../api/mock";

export default function Logs() {
  const [tab, setTab] = useState("logs");

  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

//  useEffect(() => {
//    fetchData();
//  }, []);
  useEffect(() => {
    setLogs(mockLogs);
    setAlerts(mockAlerts);
  }, []);

  // xử lý resolve ngay trên state
  const handleResolve = (id) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.alert_id === id ? { ...a, is_resolved: true } : a
      )
    );
  };

  // filter
  const filteredLogs = logs.filter((l) =>
    JSON.stringify(l).toLowerCase().includes(search.toLowerCase())
  );

  const filteredAlerts = alerts.filter((a) =>
    JSON.stringify(a).toLowerCase().includes(search.toLowerCase())
  );

  // pagination local
  const PAGE_SIZE = 5;

  const paginate = (arr) => {
    const start = (page - 1) * PAGE_SIZE;
    return arr.slice(start, start + PAGE_SIZE);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(
      (tab === "logs" ? filteredLogs.length : filteredAlerts.length) /
        PAGE_SIZE
    )
  );

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Lịch sử</h1>

        {/* Tabs + Search */}
        <div className="flex justify-between mb-4">
          <div className="flex gap-6">
            <Tab active={tab === "alerts"} onClick={() => setTab("alerts")}>
              Cảnh báo
            </Tab>

            <Tab active={tab === "logs"} onClick={() => setTab("logs")}>
              Lịch sử
            </Tab>
          </div>

          <input
            className="px-4 py-2 border rounded-lg"
            placeholder="Tìm kiếm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-sm">
          {tab === "logs" ? (
            <LogsTable data={paginate(filteredLogs)} />
          ) : (
            <AlertsTable
              data={paginate(filteredAlerts)}
              onResolve={handleResolve}
            />
          )}
        </div>

        {/* PAGINATION */}
        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      </div>
    </div>
  );
}

// ===== COMPONENTS =====
function Tab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 ${
        active
          ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
          : ""
      }`}
    >
      {children}
    </button>
  );
}

// ===== TABLE LOGS =====
function LogsTable({ data }) {
  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="p-3"></th>
          <th className="p-3">Tiêu đề</th>
          <th className="p-3">Thời gian</th>
          <th className="p-3">Hành động</th>
          <th className="p-3">Nguồn</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {data.map((log) => (
          <tr key={log.log_id} className="border-b hover:bg-gray-50">
            <td className="p-3">
              <input type="checkbox" />
            </td>

            <td className="p-3">{log.description}</td>

            <td className="p-3">{formatTime(log.created_at)}</td>

            <td className="p-3">{log.action_type}</td>

            <td className="p-3">{log.device_name || "System"}</td>

            <td className="p-3 text-gray-400 cursor-pointer">...</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ===== TABLE ALERTS =====
function AlertsTable({ data, onResolve }) {
  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="p-3"></th>
          <th className="p-3">Cảnh báo</th>
          <th className="p-3">Thời gian</th>
          <th className="p-3">Mức độ</th>
          <th className="p-3">Trạng thái</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {data.map((a) => (
          <tr key={a.alert_id} className="border-b hover:bg-gray-50">
            <td className="p-3">
              <input type="checkbox" />
            </td>

            <td className="p-3">{a.message}</td>

            <td className="p-3">{formatTime(a.created_at)}</td>

            <td className="p-3">
              <span
                className={`px-2 py-1 text-white text-xs rounded ${
                  a.severity === "critical"
                    ? "bg-red-500"
                    : a.severity === "warning"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
              >
                {a.severity}
              </span>
            </td>

            <td className="p-3">
              {a.is_resolved ? (
                <span className="text-green-600">Done</span>
              ) : (
                <span className="text-red-600">Pending</span>
              )}
            </td>

            <td className="p-3">
              {!a.is_resolved && (
                <button
                  onClick={() => onResolve(a.alert_id)}
                  className="text-blue-500"
                >
                  Resolve
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ===== PAGINATION =====
function Pagination({ page, totalPages, setPage }) {
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center gap-3 mt-4 text-sm">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="text-gray-500"
      >
        Trang trước
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`px-3 py-1 rounded ${
            p === page ? "bg-blue-500 text-white" : ""
          }`}
        >
          {p}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="text-blue-500"
      >
        Trang sau
      </button>
    </div>
  );
}

// ===== HELPER =====
function formatTime(time) {
  return new Date(time).toLocaleString();
}