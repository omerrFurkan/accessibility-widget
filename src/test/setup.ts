import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

window.scrollTo = () => {};

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("style");
  document.documentElement.className = "";
  document.body.className = "";
  window.localStorage.clear();
  vi.restoreAllMocks();
});
