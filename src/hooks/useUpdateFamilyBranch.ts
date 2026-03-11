import { postData } from "@/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseResponse } from "@/interface/baseResponse.interface";

export interface UpdateFamilyBranchPayload {
  id?: number;
  name: string;
  countryId: number;
  OrderId: number;
  IsActive: boolean;
}

export default function useUpdateFamilyBranch() {
  const qc = useQueryClient();
  return useMutation<BaseResponse<any>, Error, UpdateFamilyBranchPayload>({
    mutationFn: (body: UpdateFamilyBranchPayload) => postData<UpdateFamilyBranchPayload, BaseResponse<any>>(`/Admin/UpdateFamilyBranches`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["FamilyBranches"] });
    },
  });
}