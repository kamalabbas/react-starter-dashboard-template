export type AboutUsStatus = "DRAFT" | "PUBLISHED";

export interface AboutUsPage {
  id: number;
  contentHtml: string;
  statusCode: AboutUsStatus;
}

export interface UpdateAboutUsRequest {
  contentHtml: string;
  statusCode: AboutUsStatus;
}

export interface UploadAboutUsMediaRequest {
  image: any;
  statusCode: AboutUsStatus;
}

export interface GetAboutUsResponse {
  aboutUsPage: AboutUsPage;
}