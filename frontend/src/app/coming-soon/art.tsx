import Image from "next/image";

export function ComingSoonArt({ image, alt }: { image: string; alt: string }) {
  return (
    <div className="relative min-h-[46vh] lg:min-h-0">
      <Image src={image} alt={alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
    </div>
  );
}
