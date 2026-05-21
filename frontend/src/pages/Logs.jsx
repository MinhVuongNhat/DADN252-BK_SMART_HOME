import { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import axios from "../api/axios"; // Sử dụng instance axios đã cấu hình của bạn

export default function Logs() {
  const [tab, setTab] = useState("logs");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // State phân trang & tìm kiếm
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 10;

  // Hàm fetch dữ liệu theo phong cách Dashboard
  const fetchData = async () => {
    setLoading(true);
    try {
      // Sử dụng allSettled để xử lý nhiều API song song (nếu sau này có thêm alerts)
      const results = await Promise.allSettled([
        axios.get("/logs", {
          params: { 
            page: page, 
            limit: PAGE_SIZE, 
            search: search 
          },
        }),
        // Ví dụ: axios.get("/alerts") -> có thể thêm vào đây sau
      ]);

      // Xử lý kết quả của API Logs (vị trí index 0)
      if (results[0].status === "fulfilled") {
        const resData = results[0].value.data; // Đây là object { success, data, pagination }
        
        setLogs(resData.data || []);
        setTotalPages(resData.pagination?.totalPages || 1);
      } else {
        console.error("Lỗi API Logs:", results[0].reason);
      }

    } catch (err) {
      console.error("Lỗi hệ thống:", err);
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại khi đổi trang hoặc tìm kiếm
  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset về trang 1 khi search
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Lịch sử hoạt động</h1>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <button 
              className={`px-4 py-2 font-medium ${tab === "logs" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
              onClick={() => setTab("logs")}
            >
              Lịch sử
            </button>
          </div>

          <div className="relative">
            <input
              className="pl-4 pr-10 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Tìm kiếm hành động..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          <LogsTable data={logs} />
          
          {logs.length === 0 && !loading && (
            <div className="p-10 text-center text-gray-500">Không tìm thấy dữ liệu</div>
          )}
        </div>

        <Pagination 
          page={page} 
          totalPages={totalPages} 
          setPage={setPage} 
        />
      </div>
    </div>
  );
}

// Sub-component Table để hiển thị dữ liệu từ Controller mới
function LogsTable({ data }) {
  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
        <tr>
          <th className="p-4 font-semibold">Thời gian</th>
          <th className="p-4 font-semibold">Nguồn</th>
          <th className="p-4 font-semibold">Hành động</th>
          <th className="p-4 font-semibold">Mô tả</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((log) => (
          <tr key={log.log_id} className="hover:bg-gray-50 transition-colors">
            <td className="p-4 text-sm text-gray-600">
              {new Date(log.created_at).toLocaleString('vi-VN')}
            </td>
            <td className="p-4">
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                log.source_type === 'DEVICE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {log.source || "System"}
              </span>
            </td>
            <td className="p-4 text-sm font-medium text-gray-700">{log.action_type}</td>
            <td className="p-4 text-sm text-gray-500">{log.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Component phân trang (Giữ nguyên logic bạn đã có)
function Pagination({ page, totalPages, setPage }) {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button 
        disabled={page === 1}
        onClick={() => setPage(p => p - 1)}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        Trước
      </button>
      <span className="text-sm font-medium">Trang {page} / {totalPages}</span>
      <button 
        disabled={page === totalPages}
        onClick={() => setPage(p => p + 1)}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        Sau
      </button>
    </div>
  );
}