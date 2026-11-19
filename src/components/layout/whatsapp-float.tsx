import { WhatsAppIcon } from "@/components/ui/social-icons";
import { whatsappLink } from "@/lib/utils";

/** Quiet floating WhatsApp button — shown only when a WhatsApp number is set in settings. */
export function WhatsAppFloat({ number }: { number: string }) {
  if (!number.trim()) return null;
  return (
    <a
      href={whatsappLink(number, "Hi Kinder Thread! I have a question about sizes / an order.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-30 grid h-13 w-13 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_14px_30px_-12px_rgb(20_16_12/0.55)] transition-transform hover:scale-105 md:right-6 md:bottom-6"
    >
      <WhatsAppIcon width={24} height={24} />
    </a>
  );
}
