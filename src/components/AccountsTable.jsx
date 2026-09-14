import { useState, useEffect } from "react";
import { apiFetch } from "../api";

export default function AccountsTable() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("GET", "/api/accounts")
      .then(async (res) => {
          console.log("Response from /api/accounts:", res);
        if (!res.ok) throw new Error("Error al cargar cuentas");
        const data = await res.json();
        setAccounts(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando cuentas...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Mis Cuentas</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr>
            {/* TODO: Ajustar columnas cuando el endpoint esté definido */}
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Tipo</th>
            <th style={thStyle}>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account, i) => (
            <tr key={account.id || i}>
              {/* TODO: Mapear campos reales del endpoint */}
              <td style={tdStyle}>{account.id}</td>
              <td style={tdStyle}>{account.name}</td>
              <td style={tdStyle}>{account.type}</td>
              <td style={tdStyle}>{account.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {accounts.length === 0 && <p>No hay cuentas registradas.</p>}
    </div>
  );
}

const thStyle = { border: "1px solid #ddd", padding: "10px", backgroundColor: "#f5f5f5", textAlign: "left" };
const tdStyle = { border: "1px solid #ddd", padding: "10px" };
