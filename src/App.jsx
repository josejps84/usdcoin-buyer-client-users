import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <div style={{ fontFamily: "sans-serif", paddingTop: "50px" }}>
              <LoginForm
                onLoginSuccess={() => (window.location.href = "/dashboard")}
                onSwitch={() => (window.location.href = "/register")}
              />
            </div>
          }
        />
        <Route
          path="/register"
          element={
            <div style={{ fontFamily: "sans-serif", paddingTop: "50px" }}>
              <RegisterForm onSwitch={() => (window.location.href = "/login")} />
            </div>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
