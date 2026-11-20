import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { AuthShell } from "@/components/account/auth-shell";
import { ButtonLink } from "@/components/ui/button";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default async function ForgotPage() {
  const { store } = await getSettings();
  return (
    <AuthShell
      mode="forgot"
      title="Forgot your *password?*"
      intro="Self-service password reset by email is coming soon. Until then, our team can help you get back into your account."
    >
      <div className="flex flex-col gap-4">
        <p className="text-[0.95rem] leading-relaxed text-cocoa-600">
          Contact us from the email address or phone number on your account and we&apos;ll verify it&apos;s you and help you reset your password.
        </p>
        <div className="flex flex-wrap gap-3">
          {store.whatsapp && (
            <ButtonLink href={whatsappLink(store.whatsapp, "Hi! I need help resetting my Kinder Thread account password.")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </ButtonLink>
          )}
          <ButtonLink href="/pages/contact" variant={store.whatsapp ? "secondary" : "primary"}>
            Contact support
          </ButtonLink>
          <ButtonLink href="/account/login" variant="ghost">
            Back to sign in
          </ButtonLink>
        </div>
      </div>
    </AuthShell>
  );
}
