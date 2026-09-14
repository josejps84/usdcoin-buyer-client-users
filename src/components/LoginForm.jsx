import { useState } from "react";
import { apiFetch } from "../api";

export default function LoginForm({ onLoginSuccess, onSwitch }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    console.log("Submitting form with data:");
    e.preventDefault();
    try {
      const res = await apiFetch("POST", "/api/users/login", formData);

      console.log(res);
      if (!res.ok) {
        throw new Error("Credenciales inválidas");
      }
      const data = await res.json();

      localStorage.setItem("token", data.token);
      onLoginSuccess();
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "20px auto", textAlign: "center" }}>
      <h2>Iniciar Sesión</h2>
      <form noValidate onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input type="email" placeholder="Correo" required onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Contraseña" required onChange={e => setFormData({...formData, password: e.target.value})} />
        <button type="submit">Ingresar</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={onSwitch} style={{ marginTop: "15px", background: "none", border: "none", color: "blue", cursor: "pointer" }}>
        ¿No tienes cuenta? Regístrate
      </button>
    </div>
  );
}
