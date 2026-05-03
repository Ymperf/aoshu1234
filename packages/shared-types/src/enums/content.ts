export const DIFFICULTY_LEVELS = ["basic", "intermediate", "advanced", "competition"] as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const PAYMENT_STATUSES = [
  "pending_payment",
  "pending_review",
  "approved",
  "rejected",
  "closed"
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
