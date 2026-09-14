import { useNavigate } from "react-router-dom";
import AccountsTable from "./AccountsTable";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderBottom: "1px solid #eee" }}>
        <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Accounts</h1>
        <button onClick={handleLogout} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Cerrar Sesión
        </button>
      </div>
      <AccountsTable />
    </div>
  );
}
