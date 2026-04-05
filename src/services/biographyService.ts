import { BaseResponse } from "@/interface/baseResponse.interface";
import {
  ApproveBiographyRequest,
  BiographyPage,
  GetBiographyForAdminResponse,
  GetPendingBiographiesResponse,
  RejectBiographyRequest,
  UpdateBiographyByAdminRequest,
} from "@/interface/biography.interface";
import { getData, postData } from "./api";
import api from "./api";

export const getBiographyForAdmin = async (userId: number): Promise<BaseResponse<GetBiographyForAdminResponse>> => {
  return getData<BaseResponse<GetBiographyForAdminResponse>>(`/Admin/Pages/GetBiographyForAdmin?userId=${userId}`);
};

export const getPendingBiographies = async (): Promise<BaseResponse<GetPendingBiographiesResponse>> => {
  return getData<BaseResponse<GetPendingBiographiesResponse>>("/Admin/Pages/GetPendingBiographies");
};

export const updateBiographyByAdmin = async (payload: UpdateBiographyByAdminRequest): Promise<BaseResponse<{ biography: BiographyPage }>> => {
  return postData<UpdateBiographyByAdminRequest, BaseResponse<{ biography: BiographyPage }>>(
    "/Admin/Pages/UpdateBiographyByAdmin",
    payload
  );
};

export const approveBiography = async (payload: ApproveBiographyRequest): Promise<BaseResponse<{ biography: BiographyPage }>> => {
  return postData<ApproveBiographyRequest, BaseResponse<{ biography: BiographyPage }>>(
    "/Admin/Pages/ApproveBiography",
    payload
  );
};

export const rejectBiography = async (payload: RejectBiographyRequest): Promise<BaseResponse<{ biography: BiographyPage }>> => {
  return postData<RejectBiographyRequest, BaseResponse<{ biography: BiographyPage }>>(
    "/Admin/Pages/RejectBiography",
    payload
  );
};

export const uploadBiographyMediaByAdmin = async (payload: {
  userId: number;
  statusCode: "PENDING_APPROVAL" | "APPROVED";
  image: any;
}): Promise<BaseResponse<{ url: string }>> => {
  const formData = new FormData();
  formData.append("UserId", String(payload.userId));
  formData.append("StatusCode", payload.statusCode);

  if (payload.image?.uri) {
    formData.append(
      "Image",
      {
        uri: payload.image.uri,
        name: "biography.jpg",
        type: "image/jpeg",
      } as any
    );
  } else {
    formData.append("Image", payload.image);
  }

  const response = await api.post<BaseResponse<{ url: string }>>("/Admin/Pages/UploadBiographyMediaFile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
