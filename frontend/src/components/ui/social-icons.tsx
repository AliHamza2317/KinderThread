import type { SVGProps } from "react";

const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const InstagramIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);
export const FacebookIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M14.5 8H17V4.5h-2.5A3.5 3.5 0 0 0 11 8v2.5H8.5V14H11v6.5h3.5V14H17l.5-3.5h-3V8.6c0-.3.2-.6.5-.6Z" />
  </svg>
);
export const TikTokIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 3c.5 2.8 2.3 4.5 5 4.8" />
  </svg>
);
export const WhatsAppIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1Z" />
    <path d="M9 8.5c0 3 2.5 6 6 6.5l1.2-1.4-1.8-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-1.8L9 8.5Z" />
  </svg>
);
