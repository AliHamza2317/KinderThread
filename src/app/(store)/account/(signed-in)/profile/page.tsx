import type { Metadata } from "next";
import { PasswordForm, ProfileForm } from "@/components/account/profile-forms";
import { SignOutEverywhere } from "@/components/account/sign-out-everywhere";
import { Eyebrow } from "@/components/ui/eyebrow";
import { requireUser } from "@/lib/auth";
import { CUSTOMERS } from "@/data/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser("/account/profile");
  const row = CUSTOMERS.find((c) => c.id === user.id) ?? null;
  const sessions = 1;
  return (
    <div className="flex flex-col gap-8">
      <header>
        <Eyebrow>Profile</Eyebrow>
        <h1 className="display-md mt-3">Your details</h1>
        {row && <p className="mt-2 text-cocoa-500">Member since {formatDate(row.createdAt, { month: "long", year: "numeric" })}</p>}
      </header>

      <section className="rounded-sm border border-cocoa-100 bg-cream-50 p-5 md:p-7" aria-labelledby="details-h">
        <h2 id="details-h" className="mb-5 font-display text-xl">
          Personal details
        </h2>
        <ProfileForm name={user.name} email={user.email} phone={user.phone} />
      </section>

      <section className="rounded-sm border border-cocoa-100 bg-cream-50 p-5 md:p-7" aria-labelledby="pw-h">
        <h2 id="pw-h" className="font-display text-xl">
          Change password
        </h2>
        <p className="mt-1 mb-5 text-sm text-cocoa-500">For your security, other devices are signed out after a password change.</p>
        <PasswordForm />
      </section>

      <section className="flex flex-col gap-4 rounded-sm border border-dashed border-cocoa-200 p-5 sm:flex-row sm:items-center sm:justify-between md:p-7" aria-labelledby="sessions-h">
        <div>
          <h2 id="sessions-h" className="font-sans text-base font-bold tracking-normal">
            Signed-in devices
          </h2>
          <p className="mt-1 text-sm text-cocoa-500">
            You&apos;re signed in on {sessions} {sessions === 1 ? "device" : "devices"}. Lost a phone? Sign out everywhere.
          </p>
        </div>
        <SignOutEverywhere />
      </section>
    </div>
  );
}
