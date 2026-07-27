import { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Verificar si ya hay una sesión activa al cargar la página
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  // 1. CONDICIÓN: Si está autenticado, renderiza la página en blanco acordada
  if (isAuthenticated) {
    return (
      <div style={{ height: "100vh", width: "100vw", backgroundColor: "#ffffff" }}>
        {/* Dejamos un botón discreto de salir para que puedas hacer pruebas de regreso */}
        <button onClick={handleLogout} style={{ position: "absolute", top: 10, right: 10 }}>
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // 2. CONDICIÓN: Alternar entre Registro y Login
  return (
    <div style={{ fontFamily: "sans-serif", paddingTop: "50px" }}>
      {isRegistering ? (
        <RegisterForm onSwitch={() => setIsRegistering(false)} />
      ) : (
        <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} onSwitch={() => setIsRegistering(true)} />
      )}
    </div>
  );
}
