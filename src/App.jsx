import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";
import { getSession } from "./auth";

function ProtectedRoute({ children }) {
  if (!getSession()) return <Navigate to="/login" replace />;
  return children;
}

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div style={pageStyle}>
      <LoginForm onLoginSuccess={() => navigate("/dashboard")} onSwitch={() => navigate("/register")} />
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div style={pageStyle}>
      <RegisterForm onSwitch={() => navigate("/login")} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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

const pageStyle = { fontFamily: "sans-serif", paddingTop: "50px" };
