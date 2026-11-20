import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { saveToken } from "./auth";
import { jsonResponse, makeToken, mockFetch } from "./test/helpers";

function renderAt(path) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("App routing", () => {
  it("sends anonymous users from the dashboard to login", () => {
    renderAt("/dashboard");
    expect(screen.getByRole("heading", { name: "Iniciar Sesión" })).toBeInTheDocument();
  });

  it("treats an expired token as anonymous", () => {
    saveToken(makeToken({ exp: Math.floor(Date.now() / 1000) - 1 }));
    renderAt("/dashboard");
    expect(screen.getByRole("heading", { name: "Iniciar Sesión" })).toBeInTheDocument();
  });

  it("shows the dashboard with a valid token", async () => {
    saveToken(makeToken());
    mockFetch(jsonResponse({ accounts: [], totalItems: 0 }));
    renderAt("/dashboard");
    expect(await screen.findByText("No hay cuentas registradas.")).toBeInTheDocument();
  });

  it("serves the register page", () => {
    renderAt("/register");
    expect(screen.getByRole("heading", { name: "Crear Cuenta" })).toBeInTheDocument();
  });

  it("redirects unknown routes to login", () => {
    renderAt("/does-not-exist");
    expect(screen.getByRole("heading", { name: "Iniciar Sesión" })).toBeInTheDocument();
  });
});
