import type { BookingStatus } from "@prisma/client";

const blockingStatuses: BookingStatus[] = ["PENDING", "CONFIRMED", "ACTIVE"];

export function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA <= endB && startB <= endA;
}

export function blocksBookingWindow(status: BookingStatus) {
  return blockingStatuses.includes(status);
}
