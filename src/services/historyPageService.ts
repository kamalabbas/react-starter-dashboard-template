import { getData, postData } from "./api";
import { GetHistoryPagesResponse, HistoryPage } from "@/interface/historyPage.interface";

export interface UpdateHistoryPagePayload {
  pageId: number; // -1 for create
  title: string;
  thumbnail?: File;
  contentHtml: string;
  statusCode: "DRAFT" | "PUBLISHED";
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
