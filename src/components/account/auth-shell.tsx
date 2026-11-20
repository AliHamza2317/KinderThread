import Image from "next/image";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";

/** Split layout for sign-in / register: form on the left, calm brand panel on the right. */
export function AuthShell({ eyebrow, title, intro, children, footer }: { eyebrow: string; title: string; intro: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="bg-cream-100">
      <div className="container-kt grid items-stretch gap-6 py-3 md:py-5 lg:grid-cols-2">
        <div className="mx-auto flex w-full max-w-md flex-col justify-center px-3 py-10 md:py-14">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="display-lg mt-4">{title}</h1>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-cocoa-500">{intro}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t border-cocoa/10 pt-6 text-sm text-cocoa-500">{footer}</div>}
        </div>

        <aside className="relative hidden min-h-[600px] overflow-hidden rounded-[1.6rem] bg-cream-200 md:rounded-[2.5rem] lg:block" aria-hidden>
          <Image src="/images/gallery/g8.webp" alt="" fill sizes="(min-width: 1024px) 45vw, 0px" className="object-cover" priority />
          <div className="absolute inset-x-6 bottom-6 rounded-[1.5rem] bg-cream-50/90 p-6 backdrop-blur-md">
            <p className="font-display text-2xl leading-snug">Your little world, all in one place.</p>
            <ul className="mt-4 grid gap-2 text-sm text-cocoa-600">
              <li className="flex items-center gap-2"><Dot /> Track orders and deliveries</li>
              <li className="flex items-center gap-2"><Dot /> Save addresses for a faster checkout</li>
              <li className="flex items-center gap-2"><Dot /> Keep a wishlist across devices</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cocoa-300" />;
}
