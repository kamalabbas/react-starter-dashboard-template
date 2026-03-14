import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData } from "@/services/api";
import { BaseResponse } from "@/interface/baseResponse.interface";

export interface ChangeEmailByAdminRequest {
  userId: number;
  newEmail: string;
}

export default function useChangeEmailByAdmin() {
    const qc = useQueryClient();

    return useMutation<BaseResponse<any>, Error, ChangeEmailByAdminRequest>({
        mutationFn: (body: ChangeEmailByAdminRequest) => postData<ChangeEmailByAdminRequest, BaseResponse<any>>('/Auth/Credentials/ChangeUserEmailByAdmin', body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["users"] });
        }
    })

}