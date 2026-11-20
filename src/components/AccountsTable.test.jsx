import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AccountsTable from "./AccountsTable";
import { saveToken } from "../auth";
import { jsonResponse, mockFetch } from "../test/helpers";

const account = (overrides = {}) => ({
  accountNmbr: "acc-1",
  currentBalance: 100.5,
  currency: "USD",
  status: "ACTIVE",
  userId: 7,
  ...overrides,
});

const page = (accounts, totalItems = accounts.length) => jsonResponse({ accounts, totalItems });

describe("AccountsTable", () => {
  it("lists the accounts returned by the API", async () => {
    mockFetch(page([account(), account({ accountNmbr: "acc-2", status: "INACTIVE" })]));

    render(<AccountsTable />);

    const row1 = (await screen.findByText("acc-1")).closest("tr");
    expect(within(row1).getByText("Habilitada")).toBeInTheDocument();
    expect(within(screen.getByText("acc-2").closest("tr")).getByText("Deshabilitada")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mis Cuentas" })).toBeInTheDocument();
  });

  it("hides the edit actions for customers", async () => {
    mockFetch(page([account()]));

    render(<AccountsTable />);

    await screen.findByText("acc-1");
    expect(screen.queryByRole("button", { name: /Editar cuenta/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Actions")).not.toBeInTheDocument();
  });

  it("shows an empty state", async () => {
    mockFetch(page([]));

    render(<AccountsTable />);

    expect(await screen.findByText("No hay cuentas registradas.")).toBeInTheDocument();
  });

  it("shows the backend error message", async () => {
    mockFetch(jsonResponse({ detail: "pageSize: debe ser menor que o igual a 100" }, 400));

    render(<AccountsTable />);

    expect(await screen.findByText("pageSize: debe ser menor que o igual a 100")).toBeInTheDocument();
  });

  it("notifies when the session expired", async () => {
    saveToken("old-token");
    mockFetch(jsonResponse({}, 401));
    const onSessionExpired = vi.fn();

    render(<AccountsTable onSessionExpired={onSessionExpired} />);

    await waitFor(() => expect(onSessionExpired).toHaveBeenCalled());
  });

  it("paginates with page and pageSize query params", async () => {
    const fetchMock = mockFetch(page([account()], 25), page([account({ accountNmbr: "acc-11" })], 25));
    const user = userEvent.setup();

    render(<AccountsTable />);

    expect(await screen.findByText("Página 1 de 3")).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toContain("/api/accounts?page=0&pageSize=10");

    await user.click(screen.getByRole("button", { name: "Siguiente" }));

    expect(await screen.findByText("acc-11")).toBeInTheDocument();
    expect(fetchMock.mock.calls[1][0]).toContain("page=1&pageSize=10");
    expect(screen.getByText("Página 2 de 3")).toBeInTheDocument();
  });

  it("lets admins disable an account and shows the new status (regression)", async () => {
    mockFetch(page([account()]));
    const user = userEvent.setup();
    const onAcceptEdit = vi.fn(async (acc, updates, callbacks) => {
      callbacks.onSuccess({ ...acc, ...updates });
    });

    render(<AccountsTable isAdmin onAcceptEdit={onAcceptEdit} />);

    await user.click(await screen.findByRole("button", { name: "Editar cuenta acc-1" }));
    const accept = screen.getByRole("button", { name: "Aceptar" });
    expect(accept).toBeDisabled();

    await user.selectOptions(screen.getByLabelText("Status"), "Deshabilitada");
    expect(accept).toBeEnabled();
    await user.click(accept);

    expect(onAcceptEdit).toHaveBeenCalledWith(
      expect.objectContaining({ accountNmbr: "acc-1" }),
      { currency: "USD", status: "INACTIVE" },
      expect.any(Object),
    );
    const row = screen.getByText("acc-1").closest("tr");
    await waitFor(() => expect(within(row).getByText("Deshabilitada")).toBeInTheDocument());
    expect(screen.queryByRole("heading", { name: "Editar cuenta" })).not.toBeInTheDocument();
  });

  it("shows the error modal when saving fails", async () => {
    mockFetch(page([account()]));
    const user = userEvent.setup();
    const onAcceptEdit = vi.fn(async (_acc, _updates, callbacks) => callbacks.onError("Solo un administrador puede editar cuentas"));

    render(<AccountsTable isAdmin onAcceptEdit={onAcceptEdit} />);

    await user.click(await screen.findByRole("button", { name: "Editar cuenta acc-1" }));
    await user.selectOptions(screen.getByLabelText("Currency"), "EUR");
    await user.click(screen.getByRole("button", { name: "Aceptar" }));

    expect(await screen.findByText("Solo un administrador puede editar cuentas")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.queryByText("Solo un administrador puede editar cuentas")).not.toBeInTheDocument();
  });
});
