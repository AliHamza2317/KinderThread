export const RETURN_REASONS = [
  "Size doesn't fit",
  "Colour or style not as expected",
  "Item arrived damaged or faulty",
  "Received the wrong item",
  "Changed my mind",
  "Other",
] as const;

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  UNPAID: "Unpaid",
  PENDING_VERIFICATION: "Verifying payment",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

export const RETURN_STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  REJECTED: "Declined",
  RECEIVED: "Item received",
  COMPLETED: "Completed",
};
