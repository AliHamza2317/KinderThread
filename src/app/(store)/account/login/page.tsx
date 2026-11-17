import type { Metadata } from "next";
import Link from "next/link";
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
  return (
    <AuthShell
      eyebrow="My account"
      title="Welcome back"
      intro="Sign in to track orders, save addresses and keep your wishlist in sync."
      footer={
        <>
          New to Kinder Thread?{" "}
          <Link href={`/account/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-sage-700 link-underline">
            Create an account
          </Link>
          <span className="mt-2 block">You can also check out as a guest — no account needed.</span>
        </>
      }
    >
      {sp.signedout && (
        <p role="status" className="mb-5 rounded-md bg-sage-100 px-4 py-3 text-sm font-medium text-sage-800">
          You&apos;ve been signed out of all devices.
        </p>
      )}
      <LoginForm next={next} />
    </AuthShell>
  );
}
