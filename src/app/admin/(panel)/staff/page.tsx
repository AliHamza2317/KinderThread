import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/admin/ui";
import { CreateStaffForm, StaffCard } from "@/components/admin/content/staff-forms";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Staff" };

export default async function StaffPage() {
  const me = await requireStaff({ adminOnly: true });
  const staff = await db.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    orderBy: [{ isActive: "desc" }, { role: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
  });
  return (
    <>
      <PageHeader title="Staff" description="Who can sign in to this admin. Staff manage products, orders and marketing; administrators can also change store settings and staff." />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card title={`Team (${staff.length})`}>
          <ul className="flex flex-col gap-3">
            {staff.map((s) => (
              <StaffCard key={s.id} isSelf={s.id === me.id} member={{ ...s, lastLoginAt: s.lastLoginAt?.toISOString() ?? null, createdAt: s.createdAt.toISOString() }} />
            ))}
          </ul>
        </Card>
        <Card title="Add a team member" description="Creates a separate staff login. Customer accounts can't be reused for staff.">
          <CreateStaffForm />
        </Card>
      </div>
    </>
  );
}
