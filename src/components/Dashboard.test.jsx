import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Dashboard from "./Dashboard";
import { getToken, saveToken } from "../auth";
import { jsonResponse, makeToken, mockFetch } from "../test/helpers";

const accounts = { accounts: [{ accountNmbr: "acc-1", currentBalance: 0, currency: "USD", status: "ACTIVE", userId: 7 }], totalItems: 1 };

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<p>login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Dashboard", () => {
  it("customers see their accounts without admin actions", async () => {
    saveToken(makeToken({ sub: "jane@example.com" }));
    mockFetch(jsonResponse(accounts));

    renderDashboard();

    expect(await screen.findByText("acc-1")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mis Cuentas" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Editar cuenta/ })).not.toBeInTheDocument();
  });

  it("admins can edit; the PUT payload uses the enum status", async () => {
    saveToken(makeToken({ userType: "ADMIN" }));
    const fetchMock = mockFetch(
      jsonResponse(accounts),
      jsonResponse({ ...accounts.accounts[0], status: "INACTIVE" }),
    );
    const user = userEvent.setup();

    renderDashboard();

    expect(await screen.findByRole("heading", { name: "Todas las cuentas" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Editar cuenta acc-1" }));
    await user.selectOptions(screen.getByLabelText("Status"), "Deshabilitada");
    await user.click(screen.getByRole("button", { name: "Aceptar" }));

    expect(await screen.findByText("Deshabilitada", { selector: "td" })).toBeInTheDocument();
    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toContain("/api/accounts/edit");
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body)).toEqual({ accountNmbr: "acc-1", status: "INACTIVE", currency: "USD" });
  });

  it("shows the backend error when an edit is rejected", async () => {
    saveToken(makeToken({ userType: "ADMIN" }));
    mockFetch(jsonResponse(accounts), jsonResponse({ detail: "Cuenta no encontrada" }, 404));
    const user = userEvent.setup();

    renderDashboard();

    await user.click(await screen.findByRole("button", { name: "Editar cuenta acc-1" }));
    await user.selectOptions(screen.getByLabelText("Currency"), "EUR");
    await user.click(screen.getByRole("button", { name: "Aceptar" }));

    expect(await screen.findByText("Cuenta no encontrada")).toBeInTheDocument();
  });

  it("logout clears the token and goes to login", async () => {
    saveToken(makeToken());
    mockFetch(jsonResponse(accounts));
    const user = userEvent.setup();

    renderDashboard();

    await user.click(screen.getByRole("button", { name: "Cerrar Sesión" }));

    expect(await screen.findByText("login page")).toBeInTheDocument();
    expect(getToken()).toBeNull();
  });

  it("redirects to login when the session expires", async () => {
    saveToken(makeToken());
    mockFetch(jsonResponse({}, 401));

    renderDashboard();

    expect(await screen.findByText("login page")).toBeInTheDocument();
  });
});
