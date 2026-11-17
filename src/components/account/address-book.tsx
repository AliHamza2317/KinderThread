"use client";

import { useCallback, useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { deleteAddressAction, setDefaultAddressAction } from "@/actions/account";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/stores/toast";
import { AddressForm, type AddressValues } from "./address-form";
import { AddressText } from "./address-text";

type Addr = Required<Pick<AddressValues, "id">> & AddressValues;

export function AddressBook({ addresses, defaultName, defaultPhone }: { addresses: Addr[]; defaultName: string; defaultPhone: string | null }) {
  const [editing, setEditing] = useState<string | "new" | null>(addresses.length === 0 ? "new" : null);
  const close = useCallback(() => setEditing(null), []);
  const closeWithToast = useCallback((msg: string) => {
    setEditing(null);
    toast({ title: msg });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {editing === "new" ? (
        <section className="rounded-sm border border-cocoa-200 bg-cream-50 p-5 md:p-7" aria-label="New address">
          <h2 className="mb-5 font-display text-xl">New address</h2>
          <AddressForm onDone={() => (addresses.length ? closeWithToast("Address saved") : close())} defaultName={defaultName} defaultPhone={defaultPhone} />
        </section>
      ) : (
        <div>
          <Button variant="secondary" onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> Add a new address
          </Button>
        </div>
      )}

      {addresses.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((a) =>
            editing === a.id ? (
              <li key={a.id} className="rounded-sm border border-cocoa-200 bg-cream-50 p-5 md:col-span-2 md:p-7">
                <h2 className="mb-5 font-display text-xl">Edit address</h2>
                <AddressForm initial={a} onDone={() => closeWithToast("Address updated")} />
              </li>
            ) : (
              <li key={a.id} className="flex flex-col rounded-sm border border-cocoa-100 bg-cream-50 p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <MapPin className="h-4 w-4 text-coral-600" />
                    {a.label || "Address"}
                  </p>
                  {a.isDefault && <Badge tone="success">Default</Badge>}
                </div>
                <AddressText a={a} />
                <div className="mt-5 flex flex-wrap items-center gap-1 border-t border-cocoa-100 pt-4">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(a.id)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  {!a.isDefault && (
                    <form action={setDefaultAddressAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <Button variant="ghost" size="sm" type="submit">
                        <Star className="h-3.5 w-3.5" /> Make default
                      </Button>
                    </form>
                  )}
                  <form
                    action={deleteAddressAction}
                    onSubmit={(e) => {
                      if (!confirm("Delete this address?")) e.preventDefault();
                    }}
                    className="ml-auto"
                  >
                    <input type="hidden" name="id" value={a.id} />
                    <Button variant="ghost" size="sm" type="submit" className="text-coral-700 hover:bg-coral-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </form>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
