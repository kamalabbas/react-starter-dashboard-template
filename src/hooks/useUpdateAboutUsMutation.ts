import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData } from "@/services/api";
import api from "@/services/api";
import { BaseResponse } from "@/interface/baseResponse.interface";
import {
  UpdateAboutUsRequest,
  UploadAboutUsMediaRequest,
} from "@/interface/aboutUs.interface";

export default function useUpdateAboutUsMutation() {
  const qc = useQueryClient();

  // ✅ UPDATE
  const updateAboutUs = useMutation<BaseResponse<any>, Error, UpdateAboutUsRequest>({
    mutationFn: (body) =>
      postData("/Admin/Pages/UpdateAboutUs", body),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["about-us"] });
    },
  });

  // ✅ UPLOAD IMAGE (FIXED)
  const uploadAboutUsMedia = useMutation<BaseResponse<any>, Error, UploadAboutUsMediaRequest>({
    mutationFn: async ({ image, statusCode }) => {
      const formData = new FormData();

      formData.append("statusCode", statusCode);

      // 🔥 FIX: support BOTH (CKEditor File + Expo Image)
      if (image?.uri) {
        // Expo
        formData.append("image", {
          uri: image.uri,
          name: "about-us.jpg",
          type: "image/jpeg",
        } as any);
      } else {
        // CKEditor (File)
        formData.append("image", image);
      }

      const res = await api.post(
        "/Admin/Pages/UploadAboutUsMediaFile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return res.data;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["about-us"] });
    },
  });

  // ✅ UNDO
  const undoAboutUsDraft = useMutation<BaseResponse<any>, Error>({
    mutationFn: () =>
      postData("/Admin/Pages/UndoAboutUsDraftChanges", undefined),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["about-us"] });
    },
  });

  // ✅ RETURN ALL
  return {
    updateAboutUs,
    uploadAboutUsMedia,
    undoAboutUsDraft,
  };
}