import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AccountsTable from "./AccountsTable";
import { apiFetch, errorMessage, SessionExpiredError } from "../api";
import { clearToken, getSession } from "../auth";

export default function Dashboard() {
  const navigate = useNavigate();
  // Only decides what the UI shows; the account service enforces the real permissions
  const session = getSession();
  const isAdmin = session?.isAdmin ?? false;

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const handleSessionExpired = useCallback(() => navigate("/login", { replace: true }), [navigate]);

  const handleAcceptEdit = async (account, updates, callbacks = {}) => {
    try {
      const response = await apiFetch("PUT", "/api/accounts/edit", {
        accountNmbr: account.accountNmbr,
        status: updates.status,
        currency: updates.currency,
      });
      if (!response.ok) {
        throw new Error(await errorMessage(response, "No se pudo actualizar la cuenta"));
      }
      callbacks.onSuccess?.(await response.json());
    } catch (error) {
      if (error instanceof SessionExpiredError) return handleSessionExpired();
      callbacks.onError?.(error.message);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderBottom: "1px solid #eee" }}>
        <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Accounts</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {session?.email && <span style={{ color: "#555" }}>{session.email}</span>}
          <button onClick={handleLogout} style={{ padding: "8px 16px", cursor: "pointer" }}>
            Cerrar Sesión
          </button>
        </div>
      </div>
      <AccountsTable isAdmin={isAdmin} onAcceptEdit={handleAcceptEdit} onSessionExpired={handleSessionExpired} />
    </div>
  );
}
