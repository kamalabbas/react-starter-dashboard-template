export type PrivacyPolicyStatus = "DRAFT" | "PUBLISHED";

export interface PrivacyPolicyPage {
  id: number;
  contentHtml: string | null;
  statusCode: PrivacyPolicyStatus;
}

export interface GetPrivacyPolicyResponse {
  privacyPolicyPage: PrivacyPolicyPage | null;
}

export interface UpdatePrivacyPolicyRequest {
  contentHtml: string | null;
  statusCode: PrivacyPolicyStatus;
}

export interface UploadPrivacyPolicyMediaRequest {
  image: any;
  statusCode: PrivacyPolicyStatus;
}
