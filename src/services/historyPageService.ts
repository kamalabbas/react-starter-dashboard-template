import { getData, postData } from "./api";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { GetHistoryPagesResponse, HistoryPage } from "@/interface/historyPage.interface";

export interface UpdateHistoryPagePayload {
  pageId: number; // -1 for create
  title: string;
  thumbnail?: File;
  contentHtml: string;
  statusCode: "DRAFT" | "PUBLISHED";
}

export interface UploadHistoryMediaPayload {
  pageId: number;
  statusCode: "DRAFT" | "PUBLISHED";
  file: File;
}

export const getHistoryPages = async (): Promise<GetHistoryPagesResponse> => {
  const response = await getData<GetHistoryPagesResponse>("/Admin/Pages/GetHistory");
  return response;
};

export const updateHistoryPage = async (payload: UpdateHistoryPagePayload): Promise<HistoryPage> => {
  const formData = new FormData();
  formData.append("pageId", payload.pageId.toString());
  formData.append("title", payload.title);
  if (payload.thumbnail) {
    formData.append("thumbnail", payload.thumbnail);
  }
  formData.append("contentHtml", payload.contentHtml);
  formData.append("statusCode", payload.statusCode);

  const response = await postData<FormData, HistoryPage>("/Admin/Pages/UpdateHistory", formData);
  return response;
};

export const uploadHistoryMediaFile = async (payload: UploadHistoryMediaPayload): Promise<BaseResponse<{ url: string }>> => {
  const formData = new FormData();
  formData.append("pageId", String(payload.pageId));
  formData.append("statusCode", payload.statusCode);
  formData.append("file", payload.file);

  return postData<FormData, BaseResponse<{ url: string }>>("/Admin/Pages/UploadHistoryMediaFile", formData);
};
