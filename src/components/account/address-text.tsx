export function AddressText({ a }: { a: { fullName: string; phone: string; line1: string; line2?: string | null; city: string; postalCode?: string | null } }) {
  return (
    <address className="text-[0.92rem] leading-relaxed text-cocoa-600 not-italic">
      <span className="font-semibold text-cocoa">{a.fullName}</span>
      <br />
      {a.line1}
      {a.line2 && (
        <>
          <br />
          {a.line2}
        </>
      )}
      <br />
      {a.city}
      {a.postalCode ? ` ${a.postalCode}` : ""}
      <br />
      {a.phone}
    </address>
  );
}
