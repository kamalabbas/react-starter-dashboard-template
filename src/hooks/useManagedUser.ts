import { BaseResponse } from "@/interfaces/baseResponse.interface";
import { postData } from "@/services/api";
import { useToastStore } from "@/stores/toastStore";
import { useMutation } from "@tanstack/react-query";

export interface InviteManagedUserRequest {
  userId: number;
  managedUserId: number;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CancelInviteManagedUserRequest {
  userId: number;
  managedUserId: number;
}

export function useInviteManagedUser() {
  const showToast = useToastStore((s) => s.showToast);

  return useMutation<BaseResponse<null>, unknown, InviteManagedUserRequest>({
    mutationFn: async (payload: InviteManagedUserRequest) => {
      return await postData<InviteManagedUserRequest, BaseResponse<null>>("/FamilyTreeBe/InviteManagedUser", payload);
    },
    onSuccess: (response) => {
      console.log("Managed user invited", response);
      showToast(response.message, "success");
    },
  });
}

export function useCancelInviteManagedUser() {
  const showToast = useToastStore((s) => s.showToast);

  return useMutation<BaseResponse<null>, unknown, CancelInviteManagedUserRequest>({
    mutationFn: async (payload: CancelInviteManagedUserRequest) => {
      return await postData<CancelInviteManagedUserRequest, BaseResponse<null>>("/FamilyTreeBe/CancelInviteManagedUser", payload);
    },
    onSuccess: (response) => {
      console.log("Invite canceled", response);
      showToast(response.message, "success");
    },
  });
}
