import { useMutation } from "@tanstack/react-query";
import { postData } from "@/services/api";
import { BaseResponse } from "@/interface/baseResponse.interface";

export interface UpdateAnnouncementRequest {
  id: number;
  subject: string;
  body: string;
  isActive: boolean;
}

export interface UpdateAnnouncementResponse {
  id: number;
  subject: string;
  body: string;
  isActive: boolean;
  updatedAt?: string;
}

export default function useUpdateAnnouncement() {
  return useMutation<BaseResponse<UpdateAnnouncementResponse>, Error, UpdateAnnouncementRequest>({
    mutationFn: (payload: UpdateAnnouncementRequest) =>
      postData<UpdateAnnouncementRequest, BaseResponse<UpdateAnnouncementResponse>>(
        "/Admin/Announcement/UpdateAnnouncement",
        payload
      ),
  });
}

