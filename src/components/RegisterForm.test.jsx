import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RegisterForm from "./RegisterForm";
import { jsonResponse, mockFetch } from "../test/helpers";

async function fillAndSubmit(user) {
  await user.type(screen.getByPlaceholderText("Identificación"), "ID-1");
  await user.type(screen.getByPlaceholderText("Nombre"), "Jane Doe");
  await user.type(screen.getByPlaceholderText("Correo"), "jane@example.com");
  await user.type(screen.getByPlaceholderText(/Contraseña/), "long-enough-pw");
  await user.click(screen.getByRole("button", { name: "Registrarme" }));
}

describe("RegisterForm", () => {
  it("sends every field, including identification", async () => {
    const fetchMock = mockFetch(jsonResponse({ userId: 1 }, 201));
    const user = userEvent.setup();

    render(<RegisterForm onSwitch={vi.fn()} />);
    await fillAndSubmit(user);

    expect(await screen.findByText(/Usuario creado con éxito/)).toBeInTheDocument();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/users/register");
    expect(JSON.parse(options.body)).toEqual({
      identification: "ID-1",
      name: "Jane Doe",
      email: "jane@example.com",
      password: "long-enough-pw",
    });
  });

  it("shows the backend error", async () => {
    mockFetch(jsonResponse({ detail: "El usuario con este email ya existe" }, 409));
    const user = userEvent.setup();

    render(<RegisterForm onSwitch={vi.fn()} />);
    await fillAndSubmit(user);

    expect(await screen.findByText("El usuario con este email ya existe")).toBeInTheDocument();
  });

  it("shows network errors and allows retrying", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const user = userEvent.setup();

    render(<RegisterForm onSwitch={vi.fn()} />);
    await fillAndSubmit(user);

    expect(await screen.findByText("Failed to fetch")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrarme" })).toBeEnabled();
  });

  it("switches to the login form", async () => {
    const onSwitch = vi.fn();
    const user = userEvent.setup();

    render(<RegisterForm onSwitch={onSwitch} />);
    await user.click(screen.getByRole("button", { name: /Inicia sesión/ }));

    expect(onSwitch).toHaveBeenCalled();
  });
});
