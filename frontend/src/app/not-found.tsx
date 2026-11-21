import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-cream px-2.5 py-2.5 md:px-4 md:py-4">
      <div className="grid min-h-[calc(100dvh-1.25rem)] overflow-hidden rounded-[2rem] bg-cream-100 md:min-h-[calc(100dvh-2rem)] md:rounded-[3rem] lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center lg:items-start lg:px-16 lg:text-left">
          <div className="w-32">
            <Logo />
          </div>
          <p className="eyebrow eyebrow-rule mt-10">404</p>
          <h1 className="display-lg mt-4 max-w-md">
            This little page <span className="font-serif-accent text-sage-700">wandered off</span>
          </h1>
          <p className="mt-4 max-w-sm text-cocoa-500">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/">Back to home</ButtonLink>
            <ButtonLink href="/shop" variant="secondary">
              Shop all
            </ButtonLink>
          </div>
          <Link href="/pages/contact" className="mt-6 text-sm font-semibold text-cocoa underline underline-offset-4">
            Need help? Contact us
          </Link>
        </div>
        <div className="relative hidden lg:block">
          <Image src="/images/editorial/story-feet.webp" alt="" fill sizes="50vw" className="object-cover" />
        </div>
      </div>
    </main>
  );
}
