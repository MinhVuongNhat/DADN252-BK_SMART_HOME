import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Placeholder pages */}
        <Route path="/devices" element={<Devices />} />
        <Route path="/logs" element={<div>Logs Page</div>} />
        <Route path="/profile" element={<div>Profile Page</div>} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

<div className="bg-red-500 text-white p-10">
  TEST TAILWIND
</div>