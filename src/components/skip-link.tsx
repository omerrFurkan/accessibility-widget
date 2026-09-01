import { useEffect } from "react";
import type { AccessibilityWidgetLabels } from "./labels";

/**
 * WCAG 2.4.1 Bypass Blocks: injects a keyboard-only "Skip to content"
 * link as the first focusable element on the page. Visible on :focus.
 * The link targets #main-content, falls back to first <main>/<h1> or body.
 */
export function SkipLink({ labels }: { labels: AccessibilityWidgetLabels }) {
  useEffect(() => {
    const id = "a11y-skip-link";
    let link = document.getElementById(id) as HTMLAnchorElement | null;
    if (!link) {
      link = document.createElement("a");
      link.id = id;
      link.href = "#main-content";
      link.className = "a11y-skip-link";
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target =
          document.getElementById("main-content") ??
          document.querySelector<HTMLElement>("main, [role='main'], h1");
        if (target) {
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          document.body.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      document.body.insertAdjacentElement("afterbegin", link);
    }
    link.textContent = (labels as unknown as Record<string, string>).skipLink ?? "Ana içeriğe atla";
  }, [labels]);

  return null;
}
