import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LoginForm from "./LoginForm";
import { getToken } from "../auth";
import { jsonResponse, mockFetch } from "../test/helpers";

async function fillAndSubmit(user) {
  await user.type(screen.getByPlaceholderText("Correo"), "jane@example.com");
  await user.type(screen.getByPlaceholderText("Contraseña"), "secret-pass");
  await user.click(screen.getByRole("button", { name: "Ingresar" }));
}

describe("LoginForm", () => {
  it("stores the token and notifies on success", async () => {
    const fetchMock = mockFetch(jsonResponse({ token: "new-token" }));
    const onLoginSuccess = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onLoginSuccess={onLoginSuccess} onSwitch={vi.fn()} />);
    await fillAndSubmit(user);

    expect(onLoginSuccess).toHaveBeenCalled();
    expect(getToken()).toBe("new-token");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: "jane@example.com", password: "secret-pass" });
  });

  it("shows the backend message on invalid credentials", async () => {
    mockFetch(jsonResponse({ detail: "Credenciales inválidas" }, 401));
    const onLoginSuccess = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onLoginSuccess={onLoginSuccess} onSwitch={vi.fn()} />);
    await fillAndSubmit(user);

    expect(await screen.findByText("Credenciales inválidas")).toBeInTheDocument();
    expect(onLoginSuccess).not.toHaveBeenCalled();
    expect(getToken()).toBeNull();
  });

  it("shows network errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const user = userEvent.setup();

    render(<LoginForm onLoginSuccess={vi.fn()} onSwitch={vi.fn()} />);
    await fillAndSubmit(user);

    expect(await screen.findByText("Failed to fetch")).toBeInTheDocument();
  });

  it("switches to the register form", async () => {
    const onSwitch = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onLoginSuccess={vi.fn()} onSwitch={onSwitch} />);
    await user.click(screen.getByRole("button", { name: /Regístrate/ }));

    expect(onSwitch).toHaveBeenCalled();
  });
});
