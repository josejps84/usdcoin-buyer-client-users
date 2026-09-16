import { useNavigate } from "react-router-dom";
import AccountsTable from "./AccountsTable";
import { apiFetch } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const isAdmin = true;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleAcceptEdit = async (account, updates, callbacks = {}) => {
    const payload = {
      accountNmbr: account.accountNmbr,
      status: updates.status,
      currency: updates.currency,
    };

    try {
      const response = await apiFetch("PUT", "/api/accounts/edit", payload);
      let responseBody = null;

      try {
        responseBody = await response.json();
      } catch (parseError) {
        console.log(parseError);
        responseBody = null;
      }

      if (!response.ok) {
        throw new Error(responseBody?.message || "No se pudo actualizar la cuenta");
      }

      callbacks.onSuccess?.({
        ...account,
        ...updates,
        ...(responseBody?.account || {}),
      });
    } catch (error) {
      callbacks.onError?.(error.message);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderBottom: "1px solid #eee" }}>
        <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Accounts</h1>
        <button onClick={handleLogout} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Cerrar Sesión
        </button>
      </div>
      <AccountsTable isAdmin={isAdmin} onAcceptEdit={handleAcceptEdit} />
    </div>
  );
}
