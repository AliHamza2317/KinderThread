"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { control } from "./control";

type Opt = { value: string; label: ReactNode; text: string; disabled: boolean };

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

/** Reads the <option> children (also inside fragments and arrays). */
function readOptions(children: ReactNode): Opt[] {
  const out: Opt[] = [];
  const walk = (nodes: ReactNode) =>
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      const el = child as ReactElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>;
      if (el.type === "option") {
        const text = textOf(el.props.children);
        out.push({ value: String(el.props.value ?? text), label: el.props.children, text, disabled: !!el.props.disabled });
      } else if (el.props.children) walk(el.props.children);
    });
  walk(children);
  return out;
}

export type SelectProps = Omit<ComponentProps<"select">, "onChange" | "value" | "defaultValue"> & {
  value?: string | number | null;
  defaultValue?: string | number;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
};

/**
 * A styled dropdown that is used like a native <select> (same <option> children, value /
 * defaultValue, onChange reading e.target.value, and a hidden input carrying `name` for
 * forms). The open list is drawn by the page (white, rounded, ticked choice), which a
 * native select can't do. Keyboard: arrows, Home/End, Enter/Space, Escape, type to jump.
 */
export function Select({
  id,
  name,
  value,
  defaultValue,
  onChange,
  disabled,
  required,
  className,
  children,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: SelectProps) {
  const options = useMemo(() => readOptions(children), [children]);
  // a disabled empty option is only a placeholder ("Choose a reason"): shown on the closed box, not in the list
  const items = useMemo(() => options.filter((o) => !(o.disabled && o.value === "")), [options]);
  const controlled = value !== undefined;
  const [inner, setInner] = useState(() => String(defaultValue ?? options[0]?.value ?? ""));
  const current = controlled ? String(value ?? "") : inner;
  const selectedIndex = Math.max(0, items.findIndex((o) => o.value === current));
  const selected = options.find((o) => o.value === current);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selectedIndex);
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number; maxHeight: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const listId = useId();

  const place = useCallback(() => {
    const el = btn.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 10;
    const above = r.top - 10;
    const want = Math.min(300, items.length * 42 + 14);
    const up = below < want && above > below;
    setPos({
      left: r.left,
      width: r.width,
      top: up ? undefined : r.bottom + 6,
      bottom: up ? window.innerHeight - r.top + 6 : undefined,
      maxHeight: Math.max(150, Math.min(300, up ? above - 6 : below - 6)),
    });
  }, [items.length]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!btn.current?.contains(t) && !list.current?.contains(t)) setOpen(false);
    };
    const onMove = () => place();
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, place]);

  // keep the highlighted choice in view
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    setActive(selectedIndex);
    setOpen(true);
  };

  const choose = (o: Opt | undefined) => {
    if (!o || o.disabled) return;
    if (!controlled) setInner(o.value);
    if (o.value !== current) {
      const target = { value: o.value, name: name ?? "" };
      onChange?.({ target, currentTarget: target } as unknown as ChangeEvent<HTMLSelectElement>);
    }
    setOpen(false);
    btn.current?.focus();
  };

  const step = (from: number, dir: 1 | -1) => {
    for (let i = from + dir; i >= 0 && i < items.length; i += dir) if (!items[i].disabled) return i;
    return from;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const k = e.key;
    if (!open) {
      if (k === "ArrowDown" || k === "ArrowUp" || k === "Enter" || k === " ") {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (k === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (k === "Tab") {
      setOpen(false);
    } else if (k === "ArrowDown") {
      e.preventDefault();
      setActive((a) => step(a, 1));
    } else if (k === "ArrowUp") {
      e.preventDefault();
      setActive((a) => step(a, -1));
    } else if (k === "Home") {
      e.preventDefault();
      setActive(step(-1, 1));
    } else if (k === "End") {
      e.preventDefault();
      setActive(step(items.length, -1));
    } else if (k === "Enter" || k === " ") {
      e.preventDefault();
      choose(items[active]);
    } else if (k.length === 1 && /\S/.test(k)) {
      const now = Date.now();
      typed.current = { text: now - typed.current.at < 700 ? typed.current.text + k.toLowerCase() : k.toLowerCase(), at: now };
      const q = typed.current.text;
      const start = q.length === 1 ? active + 1 : active;
      const order = [...items.keys()].map((i) => (i + start) % items.length);
      const hit = order.find((i) => !items[i].disabled && items[i].text.trim().toLowerCase().startsWith(q));
      if (hit !== undefined) setActive(hit);
    }
  };

  const isPlaceholder = !selected || (selected.disabled && selected.value === "");

  return (
    <div className="relative">
      {name && <input type="hidden" name={name} value={current} disabled={disabled} />}
      <button
        ref={btn}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(control, "kt-select-trigger flex h-12 cursor-pointer items-center gap-2 text-left disabled:cursor-not-allowed", open && "border-cocoa-600 ring-2 ring-cocoa-100", className)}
      >
        <span className={cn("min-w-0 flex-1 truncate", isPlaceholder && "text-cocoa-400")}>{selected?.label ?? ""}</span>
        <ChevronDown aria-hidden className={cn("h-4 w-4 shrink-0 text-cocoa-400 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open &&
        pos &&
        createPortal(
          <ul
            ref={list}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            style={{ position: "fixed", left: pos.left, top: pos.top, bottom: pos.bottom, minWidth: pos.width, maxWidth: Math.max(pos.width, 320), maxHeight: pos.maxHeight }}
            className="kt-pop z-[200] overflow-auto overscroll-contain rounded-xl border border-cocoa/10 bg-white p-1.5 text-cocoa shadow-[0_24px_60px_-18px_rgb(20_16_12/0.35),0_2px_6px_rgb(20_16_12/0.06)]"
          >
            {items.map((o, i) => {
              const isSel = o.value === current;
              return (
                <li
                  key={`${o.value}-${i}`}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={o.disabled || undefined}
                  onPointerMove={() => !o.disabled && active !== i && setActive(i)}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(o)}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[0.9rem] leading-snug transition-colors",
                    o.disabled ? "cursor-default text-cocoa-300" : "cursor-pointer",
                    i === active && !o.disabled && "bg-cream-100",
                    isSel && "font-semibold text-sage-800",
                  )}
                >
                  <span className="min-w-0 flex-1">{o.label}</span>
                  {isSel && <Check aria-hidden className="h-4 w-4 shrink-0 text-sage-700" strokeWidth={2.4} />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
