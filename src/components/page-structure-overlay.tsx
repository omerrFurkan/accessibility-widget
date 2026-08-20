import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { RefreshCw, X } from "lucide-react";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import type { AccessibilityWidgetLabels, WidgetLanguage } from "./labels";

interface HeadingEntry {
  level: number;
  text: string;
  el: HTMLElement;
}

/** Collects the visible headings of the host page, excluding the widget's own. */
function collectHeadings(): HeadingEntry[] {
  const entries: HeadingEntry[] = [];
  document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6").forEach((el) => {
    if (el.closest("[data-a11y-widget]")) return;
    const text = (el.textContent ?? "").trim();
    if (!text) return;
    entries.push({ level: Number(el.tagName.slice(1)), text, el });
  });
  return entries;
}

export interface PageStructureOverlayProps {
  labels: AccessibilityWidgetLabels;
  language: WidgetLanguage;
  open: boolean;
  onClose: () => void;
}

export function PageStructureOverlay({
  labels,
  language,
  open,
  onClose,
}: PageStructureOverlayProps) {
  const [headings, setHeadings] = useState<HeadingEntry[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  useFocusTrap(overlayRef, open);

  useEffect(() => {
    if (!open) return;
    setHeadings(collectHeadings());
  }, [open]);

  if (!open) return null;

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    }
  };

  const scrollToHeading = (entry: HeadingEntry) => {
    entry.el.scrollIntoView({ behavior: "smooth", block: "start" });
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      lang={language}
      className="a11y-fixed a11y-inset-0 a11y-z-[calc(var(--a11y-widget-z)+1)] a11y-flex a11y-items-center a11y-justify-center a11y-bg-[rgba(15,23,42,0.55)] a11y-p-4"
      role="dialog"
      aria-modal="true"
      aria-label={labels.pageStructureTitle}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="a11y-flex a11y-max-h-[70vh] a11y-w-full a11y-max-w-md a11y-flex-col a11y-overflow-hidden a11y-rounded-2xl a11y-bg-[var(--a11y-widget-bg)] a11y-shadow-2xl">
        <header
          className="a11y-flex a11y-shrink-0 a11y-items-center a11y-justify-between a11y-px-4 a11y-py-3"
          style={{ backgroundColor: "var(--a11y-widget-accent)" }}
        >
          <h2 className="a11y-text-sm a11y-font-bold a11y-text-white">
            {labels.pageStructureTitle}
          </h2>
          <div className="a11y-flex a11y-items-center a11y-gap-1">
            <button
              type="button"
              onClick={() => setHeadings(collectHeadings())}
              aria-label={labels.pageStructureRefresh}
              className="a11y-inline-flex a11y-size-8 a11y-items-center a11y-justify-center a11y-rounded-full a11y-text-white"
            >
              <RefreshCw className="a11y-size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={labels.pageStructureClose}
              className="a11y-header-close a11y-inline-flex a11y-size-8 a11y-items-center a11y-justify-center a11y-rounded-full a11y-text-white"
            >
              <X className="a11y-size-4" aria-hidden="true" />
            </button>
          </div>
        </header>
        <div className="a11y-panel-scroll a11y-overflow-y-auto a11y-p-2">
          {headings.length === 0 ? (
            <p className="a11y-px-3 a11y-py-6 a11y-text-center a11y-text-sm a11y-text-muted-foreground">
              {labels.pageStructureEmpty}
            </p>
          ) : (
            <ul className="a11y-flex a11y-flex-col">
              {headings.map((entry, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => scrollToHeading(entry)}
                    className="a11y-flex a11y-w-full a11y-items-center a11y-gap-2 a11y-rounded-lg a11y-px-3 a11y-py-2 a11y-text-left a11y-text-sm a11y-transition-colors hover:a11y-bg-[var(--a11y-widget-muted)]"
                    style={{ paddingLeft: `${8 + (entry.level - 1) * 16}px` }}
                  >
                    <span className="a11y-text-[10px] a11y-font-bold a11y-text-[var(--a11y-widget-accent)]">
                      H{entry.level}
                    </span>
                    <span className="a11y-truncate">{entry.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
