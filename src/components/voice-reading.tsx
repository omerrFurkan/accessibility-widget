import { useEffect, useRef, useState } from "react";
import { useAccessibility } from "@/context/accessibility-context";
import type { VoiceReadingMode } from "@/context/types";
import type { AccessibilityWidgetLabels, WidgetLanguage } from "./labels";

export interface VoiceReadingControllerProps {
  labels: AccessibilityWidgetLabels;
  language: WidgetLanguage;
}

/** Elements eligible for hover/focus reading. */
const HOVER_TARGET_SELECTOR =
  "p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, caption, figcaption, dd, dt, summary, a, button, label, option, legend";
/** Paragraph-ish blocks read back-to-back in continuous mode. */
const CONTINUOUS_TARGET_SELECTOR = "p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, figcaption, dd, dt, caption";
/** Chrome cuts long utterances (~15 s); stay safely below that. */
const MAX_CHUNK_LENGTH = 180;
const HOVER_DEBOUNCE_MS = 150;
const SELECTION_COMMIT_MS = 250;
const DUPLICATE_READ_WINDOW_MS = 1000;

export function voiceModeLabel(
  mode: VoiceReadingMode,
  labels: AccessibilityWidgetLabels,
): string {
  switch (mode) {
    case "hover":
      return labels.voiceModeHover;
    case "selection":
      return labels.voiceModeSelection;
    case "continuous":
      return labels.voiceModeContinuous;
    default:
      return labels.contrastNormal;
  }
}

function isWidgetElement(element: Element | null): boolean {
  return element?.closest("[data-a11y-widget]") != null;
}

/** Splits text into <= MAX_CHUNK_LENGTH pieces at sentence/word boundaries. */
function splitIntoChunks(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= MAX_CHUNK_LENGTH) {
    return normalized ? [normalized] : [];
  }
  const chunks: string[] = [];
  let rest = normalized;
  while (rest.length > MAX_CHUNK_LENGTH) {
    const window = rest.slice(0, MAX_CHUNK_LENGTH + 1);
    const sentenceEnd = Math.max(
      window.lastIndexOf(". "),
      window.lastIndexOf("! "),
      window.lastIndexOf("? "),
    );
    let cut: number;
    if (sentenceEnd > 0) {
      cut = sentenceEnd + 1;
    } else {
      const wordEnd = rest.lastIndexOf(" ", MAX_CHUNK_LENGTH);
      cut = wordEnd > 0 ? wordEnd : MAX_CHUNK_LENGTH;
    }
    const piece = rest.slice(0, cut).trim();
    if (piece) chunks.push(piece);
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

interface SpeechChunk {
  text: string;
  /** Element highlighted (and scrolled to in continuous mode) while spoken. */
  element: HTMLElement | null;
}

/**
 * Text-to-speech controller driven purely by `settings.voiceReading`.
 * Renders no UI except a polite live region used for start/stop announcements;
 * self-stops by updating the central setting (never by killing speech alone).
 */
export function VoiceReadingController({
  labels,
  language,
}: VoiceReadingControllerProps) {
  const { settings, update } = useAccessibility();
  const mode = settings.voiceReading;
  const [status, setStatus] = useState("");
  const highlightedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (mode === "none") return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const languageTag = language === "tr" ? "tr-TR" : "en-US";
    const pickVoice = () => {
      const voices = synth.getVoices();
      return (
        voices.find((voice) => voice.lang.toLowerCase().startsWith(language)) ??
        voices.find((voice) => voice.default) ??
        null
      );
    };

    let disposed = false;
    let session = 0;
    let queue: SpeechChunk[] = [];
    let resumeTimer: number | null = null;

    const clearHighlight = () => {
      const highlighted = highlightedRef.current;
      if (highlighted) {
        highlighted.classList.remove("a11y-speaking");
        highlightedRef.current = null;
      }
    };

    // Guard against the known Chrome bug where synthesis silently stays paused.
    const startResumeGuard = () => {
      if (resumeTimer === null) {
        resumeTimer = window.setInterval(() => synth.resume(), 4000);
      }
    };

    const stopResumeGuard = () => {
      if (resumeTimer !== null) {
        window.clearInterval(resumeTimer);
        resumeTimer = null;
      }
    };

    const stopSpeaking = () => {
      session += 1;
      queue = [];
      synth.cancel();
      stopResumeGuard();
      clearHighlight();
    };

    const speakNextChunk = (token: number) => {
      if (disposed || token !== session) return;
      const chunk = queue.shift();
      if (!chunk) {
        stopResumeGuard();
        clearHighlight();
        if (mode === "continuous") {
          // End of document reached: route the stop through central settings.
          update({ voiceReading: "none" });
        }
        return;
      }
      if (chunk.element) {
        clearHighlight();
        chunk.element.classList.add("a11y-speaking");
        highlightedRef.current = chunk.element;
        if (mode === "continuous") {
          chunk.element.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }
      const utterance = new SpeechSynthesisUtterance(chunk.text);
      utterance.lang = languageTag;
      utterance.rate = 1;
      utterance.pitch = 1;
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.onend = () => {
        if (token === session) speakNextChunk(token);
      };
      utterance.onerror = () => {
        if (token === session) speakNextChunk(token);
      };
      startResumeGuard();
      synth.speak(utterance);
    };

    const speakChunks = (chunks: SpeechChunk[]) => {
      stopSpeaking();
      queue = chunks;
      if (queue.length > 0) {
        speakNextChunk(session);
      } else if (mode === "continuous") {
        update({ voiceReading: "none" });
      }
    };

    let hoverTimer: number | null = null;
    const speakFromTarget = (target: Element | null) => {
      if (!target || isWidgetElement(target)) return;
      const candidate = target.closest<HTMLElement>(HOVER_TARGET_SELECTOR);
      if (!candidate || isWidgetElement(candidate)) return;
      const text = (candidate.textContent ?? "").trim();
      if (!text) return;
      if (hoverTimer !== null) window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => {
        hoverTimer = null;
        speakChunks([{ text, element: candidate }]);
      }, HOVER_DEBOUNCE_MS);
    };
    const onHoverOver = (event: MouseEvent) => speakFromTarget(event.target as Element | null);
    const onFocusIn = (event: FocusEvent) => speakFromTarget(event.target as Element | null);
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      const el = document.elementFromPoint(touch.clientX, touch.clientY) as Element | null;
      speakFromTarget(el);
    };

    let selectionTimer: number | null = null;
    let lastReadText = "";
    let lastReadAt = 0;
    const readSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      const anchor = selection.anchorNode;
      if (isWidgetElement(anchor?.parentElement ?? null)) return;
      const text = selection.toString().trim();
      if (!text) return;
      const now = performance.now();
      // mouseup plus the committed selectionchange must not read twice.
      if (text === lastReadText && now - lastReadAt < DUPLICATE_READ_WINDOW_MS) return;
      lastReadText = text;
      lastReadAt = now;
      speakChunks([{ text, element: null }]);
    };
    const onMouseUp = () => readSelection();
    const onSelectionChange = () => {
      if (selectionTimer !== null) window.clearTimeout(selectionTimer);
      selectionTimer = window.setTimeout(() => {
        selectionTimer = null;
        readSelection();
      }, SELECTION_COMMIT_MS);
    };

    const collectReadableBlocks = (): HTMLElement[] =>
      Array.from(
        document.body.querySelectorAll<HTMLElement>(CONTINUOUS_TARGET_SELECTOR),
      ).filter(
        (element) =>
          !isWidgetElement(element) &&
          (element.innerText || element.textContent || "").trim().length > 0 &&
          element.getClientRects().length > 0,
      );

    const startContinuous = () => {
      const chunks: SpeechChunk[] = [];
      for (const element of collectReadableBlocks()) {
        for (const text of splitIntoChunks(element.innerText || element.textContent || "")) {
          chunks.push({ text, element });
        }
      }
      speakChunks(chunks);
    };

    const stopContinuous = () => {
      stopSpeaking();
      // The effect cleanup below performs the "stopped" announcement.
      update({ voiceReading: "none" });
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        stopContinuous();
      }
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target && isWidgetElement(target)) return;
      stopContinuous();
    };

    const onBeforeUnload = () => {
      synth.cancel();
    };

    if (mode === "hover") {
      document.addEventListener("mouseover", onHoverOver, true);
      document.addEventListener("focusin", onFocusIn, true);
      document.addEventListener("touchstart", onTouchStart, true);
    } else if (mode === "selection") {
      document.addEventListener("mouseup", onMouseUp, true);
      document.addEventListener("selectionchange", onSelectionChange, true);
    } else if (mode === "continuous") {
      startContinuous();
      document.addEventListener("keydown", onKeyDown, true);
      document.addEventListener("click", onClick, true);
    }
    window.addEventListener("beforeunload", onBeforeUnload);

    setStatus(
      `${labels.announceVoiceReadingStarted} (${voiceModeLabel(mode, labels)})`,
    );

    return () => {
      disposed = true;
      if (hoverTimer !== null) window.clearTimeout(hoverTimer);
      if (selectionTimer !== null) window.clearTimeout(selectionTimer);
      stopSpeaking();
      document.removeEventListener("mouseover", onHoverOver, true);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("touchstart", onTouchStart, true);
      document.removeEventListener("mouseup", onMouseUp, true);
      document.removeEventListener("selectionchange", onSelectionChange, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
      // This effect only runs for an active mode, so stopping is guaranteed.
      setStatus(labels.announceVoiceReadingStopped);
    };
  }, [mode, language, labels]);

  return (
    <span className="a11y-sr-only" aria-live="polite" role="status" aria-atomic="true">
      {status}
    </span>
  );
}
