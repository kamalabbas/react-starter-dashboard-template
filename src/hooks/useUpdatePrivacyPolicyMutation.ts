import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData } from "@/services/api";
import api from "@/services/api";
import { BaseResponse } from "@/interface/baseResponse.interface";
import {
  UpdatePrivacyPolicyRequest,
  UploadPrivacyPolicyMediaRequest,
} from "@/interface/privacyPolicy.interface";

export default function useUpdatePrivacyPolicyMutation() {
  const qc = useQueryClient();

  const updatePrivacyPolicy = useMutation<BaseResponse<any>, Error, UpdatePrivacyPolicyRequest>({
    mutationFn: (body) => postData("/Admin/Pages/UpdatePrivacyPolicy", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["privacy-policy"] });
    },
  });

  const uploadPrivacyPolicyMedia = useMutation<BaseResponse<any>, Error, UploadPrivacyPolicyMediaRequest>({
    mutationFn: async ({ image, statusCode }) => {
      const formData = new FormData();
      formData.append("statusCode", statusCode);

      if (image?.uri) {
        formData.append(
          "image",
          {
            uri: image.uri,
            name: "privacy-policy.jpg",
            type: "image/jpeg",
          } as any
        );
      } else {
        formData.append("image", image);
      }

      const res = await api.post("/Admin/Pages/UploadPrivacyPolicyMediaFile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["privacy-policy"] });
    },
  });

  const undoPrivacyPolicyDraft = useMutation<BaseResponse<any>, Error>({
    mutationFn: () => postData("/Admin/Pages/UndoPrivacyPolicyDraftChanges", undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["privacy-policy"] });
    },
  });

  return {
    updatePrivacyPolicy,
    uploadPrivacyPolicyMedia,
    undoPrivacyPolicyDraft,
  };
}
