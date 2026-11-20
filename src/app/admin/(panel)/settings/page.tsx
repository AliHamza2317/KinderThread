import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/content/settings-form";
import { ChangePasswordForm } from "@/components/admin/content/staff-forms";
import { requireStaff } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };

const SECTIONS = [
  { id: "store", label: "Store details" },
  { id: "social", label: "Social" },
  { id: "shipping", label: "Delivery" },
  { id: "payments", label: "Payments" },
  { id: "prelaunch", label: "Pre-launch" },
  { id: "policies", label: "Policies" },
  { id: "seo", label: "SEO" },
  { id: "features", label: "Features" },
  { id: "account", label: "My password" },
];

export default async function SettingsPage() {
  const user = await requireStaff();
  const readOnly = user.role !== "ADMIN";
  const s = await getSettings();

  return (
    <>
      <PageHeader title="Settings" description="Store-wide details used across the website, checkout and policy pages." />
      {readOnly && (
        <p className="mb-6 rounded-2xl bg-sun-50 px-5 py-4 text-sm text-sun-700 ring-1 ring-sun-200">
          You&apos;re signed in as staff, so these settings are read-only. Ask an administrator to make changes. You can still change your own password below.
        </p>
      )}

      <nav aria-label="Settings sections" className="scrollbar-none sticky top-16 z-20 -mx-4 mb-6 flex gap-2 overflow-x-auto bg-cream/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        {SECTIONS.map((x) => (
          <a key={x.id} href={`#${x.id}`} className="shrink-0 rounded-full border border-cocoa-100 bg-white/70 px-3.5 py-1.5 text-[0.8rem] font-semibold text-cocoa-600 hover:border-cocoa hover:text-cocoa">
            {x.label}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-6">
        <section id="store" className="scroll-mt-32">
          <Card title="Store details" description="Shown in the footer, contact page and order emails. Leave a field empty to hide it.">
            <SettingsForm
              settingKey="store"
              initial={s.store}
              readOnly={readOnly}
              fields={[
                { path: "name", label: "Store name" },
                { path: "tagline", label: "Tagline" },
                { path: "description", label: "Short description", type: "textarea", hint: "Used in the footer." },
                { path: "email", label: "Customer email", type: "email", placeholder: "hello@yourdomain.pk" },
                { path: "phone", label: "Phone", type: "tel", placeholder: "042 1234567" },
                { path: "whatsapp", label: "WhatsApp number", type: "tel", placeholder: "0300 1234567", hint: "Enables WhatsApp buttons on product pages and the footer." },
                { path: "hours", label: "Support hours", placeholder: "Mon–Sat, 10am – 7pm" },
                { path: "address", label: "Address", wide: true, hint: "Optional — only if customers can visit or return parcels here." },
                { path: "city", label: "City / region" },
              ]}
            />
          </Card>
        </section>

        <section id="social" className="scroll-mt-32">
          <Card title="Social media" description="Icons appear in the footer only for links you fill in.">
            <SettingsForm
              settingKey="social"
              initial={s.social}
              readOnly={readOnly}
              fields={[
                { path: "instagram", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/kinderthread" },
                { path: "instagramHandle", label: "Instagram handle", placeholder: "@kinderthread", hint: "Shown in the homepage gallery." },
                { path: "facebook", label: "Facebook URL", type: "url", placeholder: "https://facebook.com/…" },
                { path: "tiktok", label: "TikTok URL", type: "url", placeholder: "https://tiktok.com/@…" },
              ]}
            />
          </Card>
        </section>

        <section id="shipping" className="scroll-mt-32">
          <Card title="Delivery" description="Used to calculate delivery charges at checkout and in policy pages.">
            <SettingsForm
              settingKey="shipping"
              initial={s.shipping}
              readOnly={readOnly}
              fields={[
                { path: "flatRate", label: "Delivery charge (Rs.)", type: "number", hint: "Charged per order below the free-delivery threshold." },
                { path: "freeThreshold", label: "Free delivery from (Rs.)", type: "number", hint: "Set to 0 to never offer free delivery." },
                { path: "estimate", label: "Delivery time", wide: true, placeholder: "3–5 working days across Pakistan" },
                { path: "note", label: "Dispatch note", type: "textarea", rows: 2 },
              ]}
            />
          </Card>
        </section>

        <section id="payments" className="scroll-mt-32">
          <Card title="Payment methods" description="Only enabled methods appear at checkout. Manual methods (bank, JazzCash, Easypaisa) ask the customer for a transaction reference, which you verify in the order.">
            <SettingsForm
              settingKey="payments"
              initial={s.payments}
              readOnly={readOnly}
              fields={[
                { type: "heading", label: "Cash on Delivery" },
                { path: "cod.enabled", label: "Offer cash on delivery", type: "checkbox", wide: true },
                { path: "cod.fee", label: "COD fee (Rs.)", type: "number", hint: "Extra charge for COD orders. Use 0 for none." },
                { path: "cod.instructions", label: "Instructions shown at checkout", type: "textarea", rows: 2 },
                { type: "heading", label: "Bank transfer" },
                { path: "bank.enabled", label: "Offer bank transfer", type: "checkbox", wide: true },
                { path: "bank.bankName", label: "Bank name" },
                { path: "bank.accountTitle", label: "Account title" },
                { path: "bank.accountNumber", label: "Account number" },
                { path: "bank.iban", label: "IBAN" },
                { path: "bank.instructions", label: "Instructions", type: "textarea", rows: 2 },
                { type: "heading", label: "JazzCash (manual transfer)" },
                { path: "jazzcash.enabled", label: "Offer JazzCash", type: "checkbox", wide: true },
                { path: "jazzcash.accountTitle", label: "Account title" },
                { path: "jazzcash.number", label: "JazzCash number" },
                { path: "jazzcash.instructions", label: "Instructions", type: "textarea", rows: 2 },
                { type: "heading", label: "Easypaisa (manual transfer)" },
                { path: "easypaisa.enabled", label: "Offer Easypaisa", type: "checkbox", wide: true },
                { path: "easypaisa.accountTitle", label: "Account title" },
                { path: "easypaisa.number", label: "Easypaisa number" },
                { path: "easypaisa.instructions", label: "Instructions", type: "textarea", rows: 2 },
                { type: "heading", label: "Online card payments" },
                {
                  type: "note",
                  tone: "warning",
                  label: "Card / online gateway payments require a payment gateway merchant account, credentials and testing — contact your developer. This option stays switched off until the integration is live and verified.",
                },
                { path: "card.enabled", label: "Offer card payments (not available yet)", type: "checkbox", disabled: true, wide: true },
              ]}
            />
          </Card>
        </section>

        <section id="prelaunch" className="scroll-mt-32">
          <Card title="Pre-launch mode" description="Use this while your inventory is on its way.">
            <SettingsForm
              settingKey="prelaunch"
              initial={s.prelaunch}
              readOnly={readOnly}
              fields={[
                {
                  type: "note",
                  label: (
                    <>
                      When pre-launch mode is <strong>on</strong>, every shop page redirects visitors to a branded <strong>coming-soon page</strong> where they can join the launch list. Signed-in staff still see the full store (with a
                      reminder banner), so you can keep adding products. Launch sign-ups appear in{" "}
                      <Link href="/admin/newsletter?source=LAUNCH" className="font-semibold underline underline-offset-2">
                        Subscribers
                      </Link>
                      .
                    </>
                  ),
                },
                { path: "enabled", label: "Pre-launch mode is on", type: "checkbox", wide: true },
                { path: "eyebrow", label: "Eyebrow" },
                { path: "launchDate", label: "Launch date (optional)", type: "date", hint: "Shown on the coming-soon page when set." },
                { path: "heading", label: "Heading", wide: true },
                { path: "message", label: "Message", type: "textarea" },
              ]}
            />
            <p className="mt-4 text-[0.82rem] text-cocoa-500">
              <Link href="/coming-soon" target="_blank" className="font-semibold text-sage-700 underline underline-offset-2">
                Preview the coming-soon page ↗
              </Link>
            </p>
          </Card>
        </section>

        <section id="policies" className="scroll-mt-32">
          <Card title="Policies" description="Short summaries shown on product pages. Full policy text is edited under Pages.">
            <SettingsForm
              settingKey="policies"
              initial={s.policies}
              readOnly={readOnly}
              fields={[
                { path: "returnWindowDays", label: "Return / exchange window (days)", type: "number", max: 90, hint: "Customers can request returns from their account within this many days of delivery." },
                { path: "returnsSummary", label: "Returns summary", type: "textarea", rows: 2 },
                { path: "codSummary", label: "Cash on delivery summary", type: "textarea", rows: 2 },
                { path: "careDefault", label: "Default care instructions", type: "textarea", rows: 2, hint: "Used when a product has no care instructions of its own." },
              ]}
            />
          </Card>
        </section>

        <section id="seo" className="scroll-mt-32">
          <Card title="Search engines (SEO)" description="Default title and description used by Google and when links are shared.">
            <SettingsForm
              settingKey="seo"
              initial={s.seo}
              readOnly={readOnly}
              fields={[
                { path: "title", label: "Site title", wide: true, hint: "Aim for under 60 characters." },
                { path: "description", label: "Meta description", type: "textarea", rows: 2, hint: "Aim for 140–160 characters." },
                { path: "keywords", label: "Keywords", wide: true, hint: "Comma-separated." },
              ]}
            />
          </Card>
        </section>

        <section id="features" className="scroll-mt-32">
          <Card title="Features">
            <SettingsForm
              settingKey="features"
              initial={s.features}
              readOnly={readOnly}
              fields={[
                { path: "smoothScroll", label: "Smooth scrolling on desktop", type: "checkbox", wide: true, hint: "Touch devices and visitors who prefer reduced motion always use normal scrolling." },
                { path: "showSampleBadges", label: "Show “Sample” labels on product cards", type: "checkbox", wide: true, hint: "Off by default. The product page of a sample product always shows a short note that its photo is placeholder imagery." },
                { path: "tryOn", label: "Virtual try-on (planned for a later phase)", type: "checkbox", wide: true, disabled: true, hint: "Not available yet — it needs 3D garment assets per product. Customers can register interest on the try-on page." },
              ]}
            />
          </Card>
        </section>

        <section id="account" className="scroll-mt-32">
          <Card title="Change my password" description="Signs you out on every other device.">
            <ChangePasswordForm />
          </Card>
        </section>
      </div>
    </>
  );
}
