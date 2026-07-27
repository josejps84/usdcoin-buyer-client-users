import { useState } from "react";

export default function RegisterForm({ onSwitch }) {
  const [formData, setFormData] = useState({ email: "", name: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data || "Error al registrar");
      setMessage("¡Usuario creado con éxito! Ya puedes iniciar sesión.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "20px auto", textAlign: "center" }}>
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input type="text" placeholder="Nombre" required onChange={e => setFormData({...formData, name: e.target.value})} />
        <input type="email" placeholder="Correo" required onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Contraseña" required onChange={e => setFormData({...formData, password: e.target.value})} />
        <button type="submit">Registrarme</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={onSwitch} style={{ marginTop: "15px", background: "none", border: "none", color: "blue", cursor: "pointer" }}>
        ¿Ya tienes cuenta? Inicia sesión
      </button>
    </div>
  );
}
