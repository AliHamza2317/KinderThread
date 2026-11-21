import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/register-form";
import { getCurrentUser } from "@/lib/auth";
import { cleanNext } from "../next";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = cleanNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  const loginHref = `/account/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`;
  return (
    <AuthShell
      mode="register"
      next={next}
      title="Create *account*"
      intro="It takes a minute — and makes every future order quicker."
      footer={
        <>
          Already have an account?{" "}
          <Link href={loginHref} className="inline-flex items-center gap-1 font-semibold text-sage-700 hover:text-sage-800">
            Sign in <ChevronRight className="h-4 w-4" />
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthShell>
  );
}
