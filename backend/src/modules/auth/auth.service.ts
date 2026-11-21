import { conflict, forbidden, notFound, unauthorized } from "../../lib/http-error.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { signToken } from "../../lib/tokens.js";
import { User, type UserDocument } from "../users/user.model.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";

/** The user fields that are safe to send to the browser. */
export function toPublicUser(user: UserDocument) {
  return {
    id: user.id as string,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const issueToken = (user: UserDocument) => signToken({ sub: user.id as string, role: user.role, ver: user.tokenVersion });

const session = (user: UserDocument) => ({ user: toPublicUser(user), token: issueToken(user) });

// compared against when the email doesn't exist, so both cases take the same time
const DUMMY_HASH = "$2b$12$M5DxllJK8ruq/kludVQtoec9QdptSfnZX90PR6.JJi66JPPDWP6Gy";

export async function register(input: RegisterInput) {
  if (await User.exists({ email: input.email })) {
    throw conflict("An account with this email already exists. Try signing in.", { email: ["Already registered."] });
  }
  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash: await hashPassword(input.password),
    role: "CUSTOMER",
    lastLoginAt: new Date(),
  });
  return session(user);
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  const passwordOk = await verifyPassword(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordOk) throw unauthorized("Email or password is incorrect.");
  if (!user.isActive) throw forbidden("This account has been deactivated. Please contact us.");

  user.lastLoginAt = new Date();
  await user.save();
  return session(user);
}

export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw notFound("Account not found.");
  return toPublicUser(user);
}

/** Signs the user out on every device: all tokens issued before now stop working. */
export async function logoutEverywhere(userId: string) {
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
}
