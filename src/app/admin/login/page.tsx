import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { AdminLoginForm } from "./form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function AdminLogin() {
  if (isStaff(await getCurrentUser())) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-8 w-44">
          <Logo href={null} priority />
        </div>
        <div className="rounded-[1.75rem] border border-cocoa-100 bg-white/70 p-7 shadow-soft">
          <h1 className="font-display text-2xl">Store admin</h1>
          <p className="mt-1 text-sm text-cocoa-500">Sign in with your staff account.</p>
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
