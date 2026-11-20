"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, Feather, Gift, Heart, MessageCircle, Plus, Ruler, ShoppingBag, Sparkles, Trash2, Truck } from "lucide-react";
import { saveSettingsAction } from "@/actions/admin/content";
import { FormMessage, SubmitButton } from "@/components/admin/form-bits";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";

function move<T>(arr: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function RowControls({ i, count, onMove, onRemove, label }: { i: number; count: number; onMove: (dir: -1 | 1) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-cocoa-500 hover:bg-cocoa-50 disabled:opacity-30" disabled={i === 0} onClick={() => onMove(-1)} aria-label={`Move ${label} up`}>
        <ArrowUp className="h-4 w-4" />
      </button>
      <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-cocoa-500 hover:bg-cocoa-50 disabled:opacity-30" disabled={i === count - 1} onClick={() => onMove(1)} aria-label={`Move ${label} down`}>
        <ArrowDown className="h-4 w-4" />
      </button>
      <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-coral-700 hover:bg-coral-50" onClick={onRemove} aria-label={`Remove ${label}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/* --------------------------- announcement bar --------------------------- */

type Msg = { text: string; href: string };

export function AnnouncementForm({ initial }: { initial: { enabled: boolean; messages: Msg[] } }) {
  const [state, action] = useActionState(saveSettingsAction, null);
  const [enabled, setEnabled] = useState(initial.enabled);
  const [messages, setMessages] = useState<Msg[]>(initial.messages.map((m) => ({ text: m.text, href: m.href ?? "" })));
  const update = (i: number, patch: Partial<Msg>) => setMessages((m) => m.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="key" value="announcement" />
      <input type="hidden" name="payload" value={JSON.stringify({ enabled, messages })} />
      <Checkbox label={<span className="font-semibold text-cocoa">Show the announcement bar</span>} checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
      <ol className="flex flex-col gap-3">
        {messages.map((m, i) => (
          <li key={i} className="flex flex-col gap-3 rounded-lg border border-[var(--adm-line)] bg-[#fbfaf8] p-4 sm:flex-row sm:items-end">
            <Field label={`Message ${i + 1}`} htmlFor={`ann-text-${i}`} className="flex-1">
              <Input id={`ann-text-${i}`} value={m.text} maxLength={120} onChange={(e) => update(i, { text: e.target.value })} placeholder="Free delivery on orders above Rs. 4,000" />
            </Field>
            <Field label="Link" htmlFor={`ann-href-${i}`} optional className="sm:w-56">
              <Input id={`ann-href-${i}`} value={m.href} onChange={(e) => update(i, { href: e.target.value })} placeholder="/shop" />
            </Field>
            <RowControls i={i} count={messages.length} label={`message ${i + 1}`} onMove={(d) => setMessages((x) => move(x, i, d))} onRemove={() => setMessages((x) => x.filter((_, j) => j !== i))} />
          </li>
        ))}
      </ol>
      {messages.length === 0 && <p className="text-sm text-cocoa-500">No messages yet — the bar stays hidden until you add one.</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={() => setMessages((m) => [...m, { text: "", href: "" }])} disabled={messages.length >= 8}>
          <Plus className="h-4 w-4" /> Add message
        </Button>
        <p className="text-[0.8rem] text-cocoa-500">Messages rotate every few seconds. Links should start with “/” (e.g. /shop) or https://. Empty messages are removed on save.</p>
      </div>
      <FormMessage state={state} />
      <div>
        <SubmitButton pendingLabel="Saving…">Save announcement bar</SubmitButton>
      </div>
    </form>
  );
}

/* ------------------------------- benefits ------------------------------- */

export const BENEFIT_ICONS = {
  sparkles: Sparkles,
  feather: Feather,
  bag: ShoppingBag,
  chat: MessageCircle,
  truck: Truck,
  heart: Heart,
  ruler: Ruler,
  gift: Gift,
} as const;

type Benefit = { title: string; body: string; icon: string };

export function BenefitsForm({ initial }: { initial: Benefit[] }) {
  const [state, action] = useActionState(saveSettingsAction, null);
  const [items, setItems] = useState<Benefit[]>(initial);
  const update = (i: number, patch: Partial<Benefit>) => setItems((m) => m.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const clean = items.filter((b) => b.title.trim());

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="key" value="home" />
      <input type="hidden" name="payload" value={JSON.stringify({ benefits: clean })} />
      <p className="rounded-xl bg-sun-50 px-4 py-3 text-[0.85rem] text-sun-700 ring-1 ring-sun-200">
        Only list benefits the business can genuinely deliver. Avoid statistics, guarantees or claims you can&apos;t back up.
      </p>
      <ol className="flex flex-col gap-3">
        {items.map((b, i) => {
          const Icon = BENEFIT_ICONS[b.icon as keyof typeof BENEFIT_ICONS] ?? Sparkles;
          return (
            <li key={i} className="rounded-lg border border-[var(--adm-line)] bg-[#fbfaf8] p-4">
              <div className="flex items-start gap-3">
                <span className="mt-6 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage-100 text-sage-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_180px]">
                  <Field label="Title" htmlFor={`b-title-${i}`}>
                    <Input id={`b-title-${i}`} value={b.title} maxLength={60} onChange={(e) => update(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Icon" htmlFor={`b-icon-${i}`}>
                    <Select id={`b-icon-${i}`} value={b.icon} onChange={(e) => update(i, { icon: e.target.value })}>
                      {Object.keys(BENEFIT_ICONS).map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Description" htmlFor={`b-body-${i}`} className="sm:col-span-2">
                    <Textarea id={`b-body-${i}`} rows={2} value={b.body} maxLength={220} onChange={(e) => update(i, { body: e.target.value })} />
                  </Field>
                </div>
                <div className="mt-6">
                  <RowControls i={i} count={items.length} label={b.title || `benefit ${i + 1}`} onMove={(d) => setItems((x) => move(x, i, d))} onRemove={() => setItems((x) => x.filter((_, j) => j !== i))} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div>
        <Button type="button" variant="secondary" size="sm" onClick={() => setItems((m) => [...m, { title: "", body: "", icon: "sparkles" }])} disabled={items.length >= 8}>
          <Plus className="h-4 w-4" /> Add benefit
        </Button>
      </div>
      <FormMessage state={state} />
      <div>
        <SubmitButton pendingLabel="Saving…">Save benefits</SubmitButton>
      </div>
    </form>
  );
}
