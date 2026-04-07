import { BaseResponse } from "@/interface/baseResponse.interface";
import { postData } from "@/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdateUserAccessRequest {
  userId: number;
  role: "NORMAL_USER" | "ADMIN_USER";
  permissions: string[];
}

const useUpdateUserAccess = () => {
  const qc = useQueryClient();

  return useMutation<BaseResponse<any>, Error, UpdateUserAccessRequest>({
    mutationFn: (body: UpdateUserAccessRequest) => postData<UpdateUserAccessRequest, BaseResponse<any>>(`/Auth/UpdateUserAccess`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", "list"] });
      qc.invalidateQueries({ queryKey: ["auth", "permissions"] });
    },
  });
};

export default useUpdateUserAccess;
