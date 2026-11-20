import type { Metadata } from "next";
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
    <AuthShell mode="register" next={next} title="Create your *account*" intro="It takes a minute — and makes every future order quicker.">
      <RegisterForm next={next} />
    </AuthShell>
  );
}
