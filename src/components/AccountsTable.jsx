import { useEffect, useMemo, useState } from "react";
import { apiFetch, errorMessage, SessionExpiredError } from "../api";

const CURRENCY_OPTIONS = ["USD", "EUR", "PES"];
// Values match the backend AccountStatus enum
const STATUS_OPTIONS = [
  { label: "Habilitada", value: "ACTIVE" },
  { label: "Deshabilitada", value: "INACTIVE" },
];
const EMPTY_EDIT_VALUES = { currency: "", status: "ACTIVE" };
const PAGE_SIZE_OPTIONS = [3, 5, 10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

export default function AccountsTable({ isAdmin = false, onAcceptEdit, onSessionExpired }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingAccount, setEditingAccount] = useState(null);
  const [editValues, setEditValues] = useState(EMPTY_EDIT_VALUES);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    let ignore = false;

    async function fetchAccounts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({ page, pageSize }).toString();
        const res = await apiFetch("GET", `/api/accounts?${queryParams}`);
        if (!res.ok) throw new Error(await errorMessage(res, "Error al cargar cuentas"));
        const data = await res.json();
        if (ignore) return;
        setError("");
        setAccounts(data.accounts);
        setTotalItems(data.totalItems ?? 0);
      } catch (err) {
        if (err instanceof SessionExpiredError) {
          onSessionExpired?.();
          return;
        }
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchAccounts();

    return () => {
      ignore = true;
    };
  }, [page, pageSize, onSessionExpired]);

  const goToPreviousPage = () => {
    setPage((current) => Math.max(0, current - 1));
  };

  const goToNextPage = () => {
    setPage((current) => Math.min(totalPages - 1, current + 1));
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(0);
  };

  const hasChanges = useMemo(() => {
    if (!editingAccount) return false;

    return (
      editValues.currency !== (editingAccount.currency || "") ||
      editValues.status !== editingAccount.status
    );
  }, [editValues.currency, editValues.status, editingAccount]);

  const openEditPanel = (account) => {
    setEditingAccount(account);
    setEditValues({
      currency: account.currency || "",
      status: account.status || "ACTIVE",
    });
  };

  const closeEditPanel = () => {
    if (isSaving) return;
    setEditingAccount(null);
    setEditValues(EMPTY_EDIT_VALUES);
  };

  const handleAccept = async () => {
    if (!editingAccount || !hasChanges) return;

    setIsSaving(true);

    if (onAcceptEdit) {
      try {
        await onAcceptEdit(editingAccount, editValues, {
          onSuccess: (updatedAccount) => {
            setAccounts((currentAccounts) =>
              currentAccounts.map((account) =>
                account.accountNmbr === editingAccount.accountNmbr ? { ...account, ...updatedAccount } : account
              )
            );
            setEditingAccount(null);
            setEditValues(EMPTY_EDIT_VALUES);
          },
          onError: (message) => {
            setModalError(message);
          },
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (loading && accounts.length === 0) return <p>Cargando cuentas...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <style>{spinnerKeyframes}</style>
      <h2>{isAdmin ? "Todas las cuentas" : "Mis Cuentas"}</h2>
      {totalItems > 0 && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          loading={loading}
          onPreviousPage={goToPreviousPage}
          onNextPage={goToNextPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", opacity: loading ? 0.6 : 1 }}>
        <thead>
          <tr>
            <th style={thStyle}>Account Number</th>
            <th style={thStyle}>Balance</th>
            <th style={thStyle}>Currency</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>UserId</th>
            {isAdmin && <th style={thStyle}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {accounts.map((account, i) => (
            <tr key={account.accountNmbr || i}>
              <td style={tdStyle}>{account.accountNmbr}</td>
              <td style={tdStyle}>{account.currentBalance}</td>
              <td style={tdStyle}>{account.currency}</td>
              <td style={tdStyle}>{account.status === "ACTIVE" ? "Habilitada" : "Deshabilitada"}</td>
              <td style={tdStyle}>{account.userId}</td>
              {isAdmin && (
                <td style={tdStyle}>
                  <button
                    type="button"
                    onClick={() => openEditPanel(account)}
                    style={iconButtonStyle}
                    aria-label={`Editar cuenta ${account.accountNmbr}`}
                    title="Editar"
                    disabled={isSaving}
                  >
                    ✎
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {accounts.length === 0 && <p>No hay cuentas registradas.</p>}

      {isAdmin && editingAccount && (
        <div style={panelOverlayStyle}>
          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Editar cuenta</h3>
            <div style={fieldGroupStyle}>
              <label htmlFor="account-currency" style={labelStyle}>
                Currency
              </label>
              <select
                id="account-currency"
                value={editValues.currency}
                onChange={(event) =>
                  setEditValues((current) => ({
                    ...current,
                    currency: event.target.value,
                  }))
                }
                style={selectStyle}
                disabled={isSaving}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldGroupStyle}>
              <label htmlFor="account-status" style={labelStyle}>
                Status
              </label>
              <select
                id="account-status"
                value={editValues.status}
                onChange={(event) =>
                  setEditValues((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
                style={selectStyle}
                disabled={isSaving}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={panelActionsStyle}>
              <button type="button" onClick={closeEditPanel} style={secondaryButtonStyle} disabled={isSaving}>
                Cancelar
              </button>
              <button type="button" onClick={handleAccept} disabled={!hasChanges || isSaving} style={primaryButtonStyle}>
                {isSaving ? <span style={spinnerStyle} aria-hidden="true" /> : null}
                {isSaving ? "Guardando..." : "Aceptar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalError && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ marginTop: 0 }}>Error al actualizar</h3>
            <p style={{ marginBottom: "20px" }}>{modalError}</p>
            <div style={panelActionsStyle}>
              <button type="button" onClick={() => setModalError("")} style={primaryButtonStyle}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaginationControls({ page, totalPages, pageSize, loading, onPreviousPage, onNextPage, onPageSizeChange }) {
  return (
    <div style={paginationContainerStyle}>
      <div style={paginationGroupStyle}>
        <label htmlFor="page-size" style={labelStyle}>
          Filas por página
        </label>
        <select id="page-size" value={pageSize} onChange={onPageSizeChange} style={selectStyle} disabled={loading}>
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div style={paginationGroupStyle}>
        <button
          type="button"
          onClick={onPreviousPage}
          disabled={loading || page <= 0}
          style={secondaryButtonStyle}
        >
          Anterior
        </button>
        <span>
          Página {page + 1} de {totalPages}
        </span>
        <button
          type="button"
          onClick={onNextPage}
          disabled={loading || page + 1 >= totalPages}
          style={secondaryButtonStyle}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

const thStyle = { border: "1px solid #ddd", padding: "10px", backgroundColor: "#f5f5f5", textAlign: "left" };
const tdStyle = { border: "1px solid #ddd", padding: "10px" };
const paginationContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
  marginTop: "10px",
};
const paginationGroupStyle = { display: "flex", alignItems: "center", gap: "8px" };
const iconButtonStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "18px",
  lineHeight: 1,
  padding: "4px 6px",
};
const panelOverlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
};
const panelStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "20px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
};
const fieldGroupStyle = { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" };
const labelStyle = { fontWeight: 600 };
const selectStyle = { padding: "10px", border: "1px solid #ccc", borderRadius: "4px" };
const panelActionsStyle = { display: "flex", justifyContent: "flex-end", gap: "10px" };
const secondaryButtonStyle = { padding: "8px 16px", cursor: "pointer" };
const primaryButtonStyle = { padding: "8px 16px", cursor: "pointer" };
const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1000,
};
const modalStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "20px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
};
const spinnerStyle = {
  display: "inline-block",
  width: "14px",
  height: "14px",
  border: "2px solid rgba(255, 255, 255, 0.5)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  marginRight: "8px",
  verticalAlign: "text-bottom",
  animation: "spin 0.8s linear infinite",
};
const spinnerKeyframes = "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
