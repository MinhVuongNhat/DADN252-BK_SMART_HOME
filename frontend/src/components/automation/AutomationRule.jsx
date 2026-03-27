export default function AutomationRule() {
  return (
    <div className="bg-white p-6 rounded-xl shadow w-full">
      <h2 className="text-lg font-semibold mb-4">
        Tạo luật tự động
      </h2>

      <div className="flex flex-wrap gap-2 items-center">
        <span>Nếu</span>

        <select className="border p-2 rounded">
          <option>Nhiệt độ</option>
          <option>Độ ẩm</option>
          <option>Ánh sáng</option>
        </select>

        <select className="border p-2 rounded">
          <option>{">"}</option>
          <option>{"<"}</option>
          <option>{"="}</option>
        </select>

        <input
          type="number"
          className="border p-2 rounded w-24"
          placeholder="Giá trị"
        />

        <span>thì</span>

        <select className="border p-2 rounded">
          <option>Đèn</option>
          <option>Quạt</option>
        </select>

        <select className="border p-2 rounded">
          <option>Bật</option>
          <option>Tắt</option>
        </select>
      </div>

      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        Lưu luật
      </button>
    </div>
  );
}