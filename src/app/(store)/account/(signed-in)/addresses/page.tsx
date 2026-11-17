import type { Metadata } from "next";
import { AddressBook } from "@/components/account/address-book";
import { Eyebrow } from "@/components/ui/eyebrow";
import { requireUser } from "@/lib/auth";
import { ADDRESSES } from "@/data/admin";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  const addresses = ADDRESSES.filter((a) => a.userId === user.id).sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || b.createdAt.getTime() - a.createdAt.getTime());
  return (
    <div>
      <Eyebrow>Addresses</Eyebrow>
      <h1 className="display-md mt-3">Delivery addresses</h1>
      <p className="mt-2 mb-8 text-cocoa-500">Your default address is filled in automatically at checkout.</p>
      <AddressBook addresses={addresses} defaultName={user.name} defaultPhone={user.phone} />
    </div>
  );
}
