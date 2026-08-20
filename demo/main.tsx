import React from "react";
import ReactDOM from "react-dom/client";
import { AccessibilityProvider, AccessibilityWidget } from "@/index";
import App from "./App";

const rootEl = document.getElementById("root")!;

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <App />
      <AccessibilityWidget
        branding={{ name: "Accessibility Widget", url: "https://example.com" }}
      />
    </AccessibilityProvider>
  </React.StrictMode>,
);
