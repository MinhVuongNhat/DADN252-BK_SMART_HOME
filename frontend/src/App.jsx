import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Placeholder pages */}
        <Route path="/devices" element={<Devices />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/profile" element={<div>Profile Page</div>} />
      </Routes>
    </BrowserRouter>
  );

}

export default App