import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/admin/ui";
import { CreateStaffForm, StaffCard } from "@/components/admin/content/staff-forms";
import { requireStaff } from "@/lib/auth";
import { USERS } from "@/data/admin";

export const metadata: Metadata = { title: "Staff" };

export default async function StaffPage() {
  const me = await requireStaff({ adminOnly: true });
  const staff = USERS.filter((u) => u.role === "ADMIN" || u.role === "STAFF").sort(
    (a, b) => Number(b.isActive) - Number(a.isActive) || a.role.localeCompare(b.role) || a.createdAt.getTime() - b.createdAt.getTime(),
  );
  return (
    <>
      <PageHeader title="Staff" description="Who can sign in to this admin. Staff manage products, orders and marketing; administrators can also change store settings and staff." />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card title={`Team (${staff.length})`}>
          <ul className="flex flex-col gap-3">
            {staff.map((s) => (
              <StaffCard key={s.id} isSelf={s.id === me.id} member={{ id: s.id, name: s.name, email: s.email, role: s.role, isActive: s.isActive, lastLoginAt: s.lastLoginAt?.toISOString() ?? null, createdAt: s.createdAt.toISOString() }} />
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
