import { useState } from "react";
import { apiFetch, errorMessage } from "../api";
import { saveToken } from "../auth";

export default function LoginForm({ onLoginSuccess, onSwitch }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await apiFetch("POST", "/api/users/login", formData);
      if (!res.ok) {
        throw new Error(await errorMessage(res, "Credenciales inválidas"));
      }
      const data = await res.json();
      saveToken(data.token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "20px auto", textAlign: "center" }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input type="email" placeholder="Correo" required autoComplete="email"
          onChange={e => setFormData({ ...formData, email: e.target.value })} />
        <input type="password" placeholder="Contraseña" required autoComplete="current-password"
          onChange={e => setFormData({ ...formData, password: e.target.value })} />
        <button type="submit" disabled={submitting}>{submitting ? "Ingresando..." : "Ingresar"}</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={onSwitch} style={linkButtonStyle}>
        ¿No tienes cuenta? Regístrate
      </button>
    </div>
  );
}

const linkButtonStyle = { marginTop: "15px", background: "none", border: "none", color: "blue", cursor: "pointer" };
