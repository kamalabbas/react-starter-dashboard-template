import { BaseResponse } from "@/interface/baseResponse.interface";
import { postData } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface DeactivateUserRequest {
  userId: number;
}

const useDeactivateUser = () => {
  const qc = useQueryClient();

  return useMutation<BaseResponse<any>, Error, DeactivateUserRequest>({
    mutationFn: (body: DeactivateUserRequest) =>
      postData<DeactivateUserRequest, BaseResponse<any>>("/Auth/DeactivateUser", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
};

export default useDeactivateUser;