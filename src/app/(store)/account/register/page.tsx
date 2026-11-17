import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/register-form";
import { getCurrentUser } from "@/lib/auth";
import { cleanNext } from "../next";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = cleanNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return (
    <AuthShell
      eyebrow="Join our little world"
      title="Create your account"
      intro="It takes a minute — and makes every future order quicker."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/account/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-sage-700 link-underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthShell>
  );
}
