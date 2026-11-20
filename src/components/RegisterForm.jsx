import { useState } from "react";
import { apiFetch, errorMessage } from "../api";

export default function RegisterForm({ onSwitch }) {
  const [formData, setFormData] = useState({ identification: "", name: "", email: "", password: "" });
  const [message, setMessage] = useState({ text: "", isError: false });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("POST", "/api/users/register", formData);
      if (!res.ok) throw new Error(await errorMessage(res, "Error al registrar"));
      setMessage({ text: "¡Usuario creado con éxito! Ya puedes iniciar sesión.", isError: false });
    } catch (err) {
      setMessage({ text: err.message, isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <div style={{ maxWidth: "300px", margin: "20px auto", textAlign: "center" }}>
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input type="text" placeholder="Identificación" required onChange={update("identification")} />
        <input type="text" placeholder="Nombre" required autoComplete="name" onChange={update("name")} />
        <input type="email" placeholder="Correo" required autoComplete="email" onChange={update("email")} />
        <input type="password" placeholder="Contraseña (mínimo 8 caracteres)" required minLength={8}
          autoComplete="new-password" onChange={update("password")} />
        <button type="submit" disabled={submitting}>{submitting ? "Registrando..." : "Registrarme"}</button>
      </form>
      {message.text && <p style={{ color: message.isError ? "red" : "green" }}>{message.text}</p>}
      <button onClick={onSwitch} style={{ marginTop: "15px", background: "none", border: "none", color: "blue", cursor: "pointer" }}>
        ¿Ya tienes cuenta? Inicia sesión
      </button>
    </div>
  );
}
