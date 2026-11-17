import Image from "next/image";

export function ComingSoonArt() {
  return (
    <div className="relative hidden items-center justify-center bg-bear-100 lg:flex">
      <div className="absolute inset-[12%] rounded-full bg-cream/60" />
      <Image src="/brand/hero-bear.webp" alt="" width={640} height={584} priority className="relative mix-blend-multiply" />
    </div>
  );
}
