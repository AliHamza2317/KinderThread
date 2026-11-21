import type { QueryFilter } from "mongoose";
import { conflict, notFound } from "../../lib/http-error.js";
import { hashPassword } from "../../lib/password.js";
import type { AuthUser } from "../../middleware/auth.js";
import { toPublicUser } from "../auth/auth.service.js";
import { User, type UserDocument } from "../users/user.model.js";
import type { CreateStaffInput } from "./staff.validation.js";

/** Staff and admins (customers live in the same collection). */
const isStaff: QueryFilter<UserDocument> = { role: { $in: ["ADMIN", "STAFF"] } };

const toStaffView = (user: UserDocument) => ({ ...toPublicUser(user), isActive: user.isActive, lastLoginAt: user.lastLoginAt ?? null });

export async function listStaff() {
  const users = await User.find(isStaff).sort({ role: 1, name: 1 });
  return users.map(toStaffView);
}

export async function createStaff(input: CreateStaffInput) {
  const existing = await User.findOne({ email: input.email }).select("role");
  if (existing) {
    throw conflict(
      existing.role === "CUSTOMER" ? "A customer account already uses this email. Use a different email for the staff account." : "A staff account with this email already exists.",
      { email: ["Already in use."] },
    );
  }
  const user = await User.create({ name: input.name, email: input.email, role: input.role, passwordHash: await hashPassword(input.password) });
  return toStaffView(user);
}

/** Loads another staff account; nobody can change their own role or status here. */
async function loadOther(id: string, actor: AuthUser) {
  const user = await User.findOne({ ...isStaff, _id: id });
  if (!user) throw notFound("This account no longer exists.");
  if (user.id === actor.id) throw conflict("You can't change your own role or status here.");
  return user;
}

/** The store must always keep at least one active administrator. */
async function assertAnotherAdmin(excludeId: string) {
  const others = await User.countDocuments({ role: "ADMIN", isActive: true, _id: { $ne: excludeId } });
  if (others === 0) throw conflict("Keep at least one active administrator.");
}

export async function setRole(id: string, role: "ADMIN" | "STAFF", actor: AuthUser) {
  const user = await loadOther(id, actor);
  if (user.role === "ADMIN" && role !== "ADMIN") await assertAnotherAdmin(id);
  user.role = role;
  user.tokenVersion += 1; // new permissions apply from the next sign-in
  await user.save();
  return toStaffView(user);
}

export async function setActive(id: string, isActive: boolean, actor: AuthUser) {
  const user = await loadOther(id, actor);
  if (!isActive && user.role === "ADMIN") await assertAnotherAdmin(id);
  user.isActive = isActive;
  if (!isActive) user.tokenVersion += 1;
  await user.save();
  return toStaffView(user);
}

export async function resetPassword(id: string, password: string, actor: AuthUser) {
  const user = await loadOther(id, actor);
  user.passwordHash = await hashPassword(password);
  user.tokenVersion += 1;
  await user.save();
  return toStaffView(user);
}
