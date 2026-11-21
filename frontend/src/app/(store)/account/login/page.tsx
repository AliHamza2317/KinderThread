import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/login-form";
import { getCurrentUser } from "@/lib/auth";
import { cleanNext } from "../next";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; signedout?: string }> }) {
  const sp = await searchParams;
  const next = cleanNext(sp.next);
  if (await getCurrentUser()) redirect(next);
  const registerHref = `/account/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`;
  return (
    <AuthShell
      mode="login"
      next={next}
      title="Welcome *back*"
      intro="Sign in to track orders, save addresses and keep your wishlist in sync."
      footer={
        <>
          New to Kinder Thread?{" "}
          <Link href={registerHref} className="inline-flex items-center gap-1 font-semibold text-sage-700 hover:text-sage-800">
            Create an account <ChevronRight className="h-4 w-4" />
          </Link>
        </>
      }
    >
      {sp.signedout && (
        <p role="status" className="mb-5 rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-800">
          You&apos;ve been signed out of all devices.
        </p>
      )}
      <LoginForm next={next} />
    </AuthShell>
  );
}
