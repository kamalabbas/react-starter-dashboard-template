export type BiographyStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
export type BiographyAdminEditableStatus = "PENDING_APPROVAL" | "APPROVED";

export interface BiographyPage {
  id: number;
  biographyId: number;
  userId: number;
  contentHtml: string | null;
  statusCode: BiographyStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
  adminDecisionAt: string | null;
  adminDecisionBy: number | null;
  createdAt: string;
  updatedAt: string;
  fullName: string | null;
  profilePicUrl: string | null;
}

export interface BiographyWorkspace {
  approvedBiography: BiographyPage | null;
  workingBiography: BiographyPage | null;
}

export interface GetBiographyForAdminResponse {
  biography: BiographyWorkspace;
}

export interface GetPendingBiographiesResponse {
  biographies: BiographyPage[];
}

export interface UpdateBiographyByAdminRequest {
  userId: number;
  contentHtml: string | null;
  statusCode: BiographyAdminEditableStatus;
}

export interface ApproveBiographyRequest {
  userId: number;
}

export interface RejectBiographyRequest {
  userId: number;
  rejectionReason: string;
}

export interface UploadBiographyMediaByAdminRequest {
  userId: number;
  statusCode: BiographyAdminEditableStatus;
  image: any;
}
