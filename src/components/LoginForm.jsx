import { useState } from "react";

export default function LoginForm({ onLoginSuccess, onSwitch }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error("Credenciales inválidas");
      const data = await res.json();
      
      // Guardar el token devuelto por Go en el almacenamiento del navegador
      localStorage.setItem("token", data.token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "20px auto", textAlign: "center" }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
