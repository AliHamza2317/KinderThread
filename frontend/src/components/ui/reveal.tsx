import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** kept for API compatibility; the reveal follows scroll position, not time */
  delay?: number;
  y?: number;
  /** reveal direct children one after another instead of the wrapper as a whole */
  stagger?: number;
  start?: string;
};

/**
 * Gentle rise-in as content scrolls into view, done entirely in CSS
 * (scroll-driven animations — see `[data-reveal]` in globals.css).
 * Content is always visible without JavaScript, in browsers without
 * scroll-driven animation support, and for people who prefer reduced motion.
 */
export function Reveal({ children, as: Tag = "div", className, stagger }: Props) {
  return (
    <Tag className={className} data-reveal={stagger ? "children" : "self"}>
      {children}
    </Tag>
  );
}

/** Heading text where *word* (or a word listed in italicWords) is set in the serif italic accent. */
export function SplitWords({ text, className, as: Tag = "span", italicWords = [] }: { text: string; className?: string; delay?: number; as?: ElementType; italicWords?: string[] }) {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      {words.map((w, i) => {
        const accent = /^\*.+\*[.,!?]?$/.test(w) || italicWords.includes(w.replace(/[.,!?*]/g, ""));
        const word = w.replace(/\*/g, "");
        return (
          <span key={i}>
            {accent ? <span className="font-serif-accent pr-[0.04em] text-sage-700">{word}</span> : word}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </Tag>
  );
}
