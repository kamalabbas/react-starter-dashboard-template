import { postData } from "@/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { BranchCountry } from "@/interface/enums";

export interface UpdateFamilyBranchRequest {
  id?: number;
  name: string;
  countryId: BranchCountry;
  orderId: number;
  isActive: boolean;
}

export default function useUpdateFamilyBranch() {
  const qc = useQueryClient();
  return useMutation<BaseResponse<any>, Error, UpdateFamilyBranchRequest>({
    mutationFn: (body: UpdateFamilyBranchRequest) => postData<UpdateFamilyBranchRequest, BaseResponse<any>>(`/Admin/UpdateFamilyBranches`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["FamilyBranches"] });
    },
  });
}