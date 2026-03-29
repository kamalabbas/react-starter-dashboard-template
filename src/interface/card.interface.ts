export type CardRequestPurposeCode = "NEW_CARD" | "LOST_CARD" | "RENEW_CARD" | "DAMAGED_CARD";

export type CardRequestStatusCode = "REQUESTED" | "ACCEPTED" | "REJECTED" | "CANCELED";

export type CardPaymentStatusCode = "NOT_REQUIRED" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface CardRequest {
  id: number;
  userId: number;
  userEmail?: string | null;
  purposeCode: CardRequestPurposeCode;
  statusCode: CardRequestStatusCode;
  paymentStatus: CardPaymentStatusCode;
  feeAmount: number;
  previousCardId: number;
  createdCardId: number;
  adminDecisionReason: string | null;
  adminDecisionAt: string | null;
  adminDecisionBy: number;
  createdAt: string;
  fullName: string | null;
  profilePicUrl: string | null;
}

export interface GetPendingCardRequestsResponse {
  cardRequests: CardRequest[];
}

export interface AcceptCardRequestPayload {
  adminUserId: number;
  cardRequestId: number;
}

export interface RejectCardRequestPayload {
  adminUserId: number;
  cardRequestId: number;
  adminDecisionReason: string;
}