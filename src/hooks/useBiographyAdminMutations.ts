import { BaseResponse } from "@/interface/baseResponse.interface";
import {
  ApproveBiographyRequest,
  BiographyPage,
  RejectBiographyRequest,
  UpdateBiographyByAdminRequest,
} from "@/interface/biography.interface";
import {
  approveBiography,
  rejectBiography,
  updateBiographyByAdmin,
  uploadBiographyMediaByAdmin,
} from "@/services/biographyService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useBiographyAdminMutations(selectedUserId: number | null) {
  const queryClient = useQueryClient();

  const invalidate = async (targetUserId?: number) => {
    const userId = targetUserId ?? selectedUserId;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["biography", "pending"] }),
      queryClient.invalidateQueries({ queryKey: ["biography", "workspace", userId] }),
    ]);
  };

  const updateMutation = useMutation<BaseResponse<{ biography: BiographyPage }>, Error, UpdateBiographyByAdminRequest>({
    mutationFn: updateBiographyByAdmin,
    onSuccess: async (_, variables) => {
      await invalidate(variables.userId);
    },
  });

  const approveMutation = useMutation<BaseResponse<{ biography: BiographyPage }>, Error, ApproveBiographyRequest>({
    mutationFn: approveBiography,
    onSuccess: async (_, variables) => {
      await invalidate(variables.userId);
    },
  });

  const rejectMutation = useMutation<BaseResponse<{ biography: BiographyPage }>, Error, RejectBiographyRequest>({
    mutationFn: rejectBiography,
    onSuccess: async (_, variables) => {
      await invalidate(variables.userId);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadBiographyMediaByAdmin,
  });

  return {
    updateMutation,
    approveMutation,
    rejectMutation,
    uploadMutation,
  };
}
