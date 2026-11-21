import { badRequest, conflict, notFound } from "../../lib/http-error.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { issueToken, toPublicUser } from "../auth/auth.service.js";
import { getProductsByIds } from "../catalog/product.service.js";
import { Order } from "../orders/order.model.js";
import { toCustomerOrder } from "../orders/order.views.js";
import type { ReturnRequestInput } from "../returns/return.validation.js";
import { requestReturn, returnEligibility, returnsForOrder } from "../returns/return.service.js";
import { User, type UserDocument } from "../users/user.model.js";
import type { AddressInput, ProfileInput } from "./account.validation.js";

const MAX_ADDRESSES = 10;

async function loadUser(userId: string, withPassword = false): Promise<UserDocument> {
  const query = User.findById(userId);
  const user = await (withPassword ? query.select("+passwordHash") : query);
  if (!user) throw notFound("Account not found.");
  return user;
}

/* profile */

export async function updateProfile(userId: string, input: ProfileInput) {
  const user = await loadUser(userId);
  if (input.email !== user.email && (await User.exists({ email: input.email }))) {
    throw conflict("Another account already uses this email.", { email: ["Already in use."] });
  }
  user.set(input);
  await user.save();
  return toPublicUser(user);
}

/** Changes the password and signs out other devices; returns a fresh token for this one. */
export async function changePassword(userId: string, current: string, next: string) {
  const user = await loadUser(userId, true);
  if (!(await verifyPassword(current, user.passwordHash))) {
    throw badRequest("Your current password is incorrect.", { current: ["Incorrect password."] });
  }
  user.passwordHash = await hashPassword(next);
  user.tokenVersion += 1;
  await user.save();
  return { token: issueToken(user) };
}

/* addresses */

export async function listAddresses(userId: string) {
  return (await loadUser(userId)).addresses;
}

/** Keeps exactly one default address (the first one added becomes the default). */
function applyDefault(user: UserDocument, defaultId?: string) {
  const id = defaultId ?? (user.addresses.find((a) => a.isDefault) ?? user.addresses[0])?._id.toString();
  user.addresses.forEach((address) => {
    address.isDefault = address._id.toString() === id;
  });
}

export async function addAddress(userId: string, input: AddressInput) {
  const user = await loadUser(userId);
  if (user.addresses.length >= MAX_ADDRESSES) throw badRequest(`You can save up to ${MAX_ADDRESSES} addresses.`);
  const address = user.addresses.create(input);
  user.addresses.push(address);
  applyDefault(user, input.isDefault ? address._id.toString() : undefined);
  await user.save();
  return user.addresses;
}

export async function updateAddress(userId: string, addressId: string, input: AddressInput) {
  const user = await loadUser(userId);
  const address = user.addresses.id(addressId);
  if (!address) throw notFound("That address could not be found.");
  address.set(input);
  applyDefault(user, input.isDefault ? addressId : undefined);
  await user.save();
  return user.addresses;
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const user = await loadUser(userId);
  if (!user.addresses.id(addressId)) throw notFound("That address could not be found.");
  applyDefault(user, addressId);
  await user.save();
  return user.addresses;
}

export async function deleteAddress(userId: string, addressId: string) {
  const user = await loadUser(userId);
  const address = user.addresses.id(addressId);
  if (!address) throw notFound("That address could not be found.");
  address.deleteOne();
  applyDefault(user);
  await user.save();
  return user.addresses;
}

/* wishlist */

export async function getWishlist(userId: string) {
  const user = await loadUser(userId);
  return getProductsByIds(user.wishlist.map(String));
}

export async function setWishlist(userId: string, productIds: string[]) {
  await User.updateOne({ _id: userId }, { $set: { wishlist: [...new Set(productIds)] } });
  return getWishlist(userId);
}

export async function addToWishlist(userId: string, productId: string) {
  await User.updateOne({ _id: userId }, { $addToSet: { wishlist: productId } });
  return getWishlist(userId);
}

export async function removeFromWishlist(userId: string, productId: string) {
  await User.updateOne({ _id: userId }, { $pull: { wishlist: productId } });
  return getWishlist(userId);
}

/* orders & returns */

export async function listMyOrders(userId: string) {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
  return orders.map(toCustomerOrder);
}

async function findMyOrder(userId: string, number: string) {
  const order = await Order.findOne({ user: userId, number: number.toUpperCase() });
  if (!order) throw notFound("We couldn't find that order.");
  return order;
}

/** One order with its return requests and whether a new return can be requested. */
export async function getMyOrder(userId: string, number: string) {
  const order = await findMyOrder(userId, number);
  const [returns, eligibility] = await Promise.all([returnsForOrder(order._id), returnEligibility(order)]);
  return { ...toCustomerOrder(order), returns, returnEligibility: eligibility };
}

export async function requestMyReturn(userId: string, number: string, input: ReturnRequestInput) {
  const order = await findMyOrder(userId, number);
  return requestReturn(order, userId, input);
}
