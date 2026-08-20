import { describe, expect, it } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccessibilityProvider, useAccessibility } from "./accessibility-context";
import { DEFAULT_SETTINGS } from "./types";

const KEY = "test:a11y:context";

function Consumer() {
  const { settings, update, reset, applyProfile, isPanelOpen, togglePanel } =
    useAccessibility();
  return (
    <div>
      <span data-testid="scale">{settings.fontSizeScale}</span>
      <span data-testid="dark">{String(settings.darkMode)}</span>
      <span data-testid="open">{String(isPanelOpen)}</span>
      <span data-testid="profile">{settings.activeProfileId ?? "none"}</span>
      <button onClick={() => update({ fontSizeScale: 1.3 })}>grow</button>
      <button onClick={() => update({ darkMode: true })}>dark</button>
      <button onClick={() => applyProfile("dyslexia")}>apply profile</button>
      <button onClick={() => applyProfile("low-vision")}>apply low-vision</button>
      <button onClick={reset}>reset</button>
      <button onClick={togglePanel}>toggle</button>
    </div>
  );
}

describe("AccessibilityProvider", () => {
  it("persists settings to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <Consumer />
      </AccessibilityProvider>,
    );
    await user.click(screen.getByText("grow"));
    await user.click(screen.getByText("dark"));
    const stored = JSON.parse(window.localStorage.getItem(KEY)!);
    expect(stored.fontSizeScale).toBe(1.3);
    expect(stored.darkMode).toBe(true);
  });

  it("restores settings from localStorage on mount", async () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, fontSizeScale: 1.4, darkMode: true }),
    );
    render(
      <AccessibilityProvider storageKey={KEY}>
        <Consumer />
      </AccessibilityProvider>,
    );
    await act(async () => {});
    expect(screen.getByTestId("scale")).toHaveTextContent("1.4");
    expect(screen.getByTestId("dark")).toHaveTextContent("true");
  });

  it("applies DOM effects when settings change", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <Consumer />
      </AccessibilityProvider>,
    );
    await user.click(screen.getByText("dark"));
    expect(document.documentElement.classList.contains("a11y-dark-mode")).toBe(true);
  });

  it("applies a profile and clears the marker on manual updates", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <Consumer />
      </AccessibilityProvider>,
    );
    await user.click(screen.getByText("apply profile"));
    expect(screen.getByTestId("profile")).toHaveTextContent("dyslexia");
    expect(document.body.classList.contains("a11y-dyslexia-font")).toBe(true);

    // A manual update deselects the profile but keeps the applied values.
    await user.click(screen.getByText("grow"));
    expect(screen.getByTestId("profile")).toHaveTextContent("none");
    expect(document.body.classList.contains("a11y-dyslexia-font")).toBe(true);
  });

  it("toggles the active profile off and reverts its settings to defaults", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <Consumer />
      </AccessibilityProvider>,
    );
    await user.click(screen.getByText("dark"));
    await user.click(screen.getByText("apply profile"));
    expect(screen.getByTestId("profile")).toHaveTextContent("dyslexia");
    expect(document.body.classList.contains("a11y-dyslexia-font")).toBe(true);

    await user.click(screen.getByText("apply profile"));
    expect(screen.getByTestId("profile")).toHaveTextContent("none");
    expect(document.body.classList.contains("a11y-dyslexia-font")).toBe(false);
    expect(document.documentElement.classList.contains("a11y-text-spacing")).toBe(false);
    // Personal settings that the profile did not touch remain intact.
    expect(screen.getByTestId("dark")).toHaveTextContent("true");
  });

  it("drops the previous profile's settings when switching profiles", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <Consumer />
      </AccessibilityProvider>,
    );
    await user.click(screen.getByText("dark"));
    await user.click(screen.getByText("apply profile"));
    expect(screen.getByTestId("profile")).toHaveTextContent("dyslexia");
    expect(document.body.classList.contains("a11y-dyslexia-font")).toBe(true);

    await user.click(screen.getByText("apply low-vision"));
    expect(screen.getByTestId("profile")).toHaveTextContent("low-vision");
    // The dyslexia profile's features are gone...
    expect(document.body.classList.contains("a11y-dyslexia-font")).toBe(false);
    expect(document.documentElement.style.getPropertyValue("--a11y-letter-spacing")).toBe("0em");
    // ...the new profile's features are applied...
    expect(document.documentElement.classList.contains("a11y-font-scaling")).toBe(true);
    expect(document.body.classList.contains("a11y-large-cursor")).toBe(true);
    // ...and personal settings remain untouched.
    expect(screen.getByTestId("dark")).toHaveTextContent("true");
  });

  it("resets settings, profile and clears DOM effects", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <Consumer />
      </AccessibilityProvider>,
    );
    await user.click(screen.getByText("apply profile"));
    expect(screen.getByTestId("profile")).toHaveTextContent("dyslexia");
    await user.click(screen.getByText("reset"));
    expect(screen.getByTestId("profile")).toHaveTextContent("none");
    expect(screen.getByTestId("scale")).toHaveTextContent("1");
    expect(document.documentElement.classList.contains("a11y-font-scaling")).toBe(false);
  });

  it("tracks panel open state", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <Consumer />
      </AccessibilityProvider>,
    );
    expect(screen.getByTestId("open")).toHaveTextContent("false");
    await user.click(screen.getByText("toggle"));
    expect(screen.getByTestId("open")).toHaveTextContent("true");
  });

  it("throws when used outside a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(/AccessibilityProvider/);
    spy.mockRestore();
  });
});

