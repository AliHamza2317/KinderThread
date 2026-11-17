import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-6 py-16 text-center">
      <div className="max-w-md">
        <div className="mx-auto w-40">
          <Logo />
        </div>
        <p className="eyebrow eyebrow-rule mt-10 justify-center">404</p>
        <h1 className="display-md mt-4">This little page wandered off</h1>
        <p className="mt-4 text-cocoa-500">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/shop" variant="secondary">
            Shop all
          </ButtonLink>
        </div>
        <Link href="/pages/contact" className="mt-6 inline-block text-sm font-semibold text-sage-700 underline">
          Need help? Contact us
        </Link>
      </div>
    </main>
  );
}
