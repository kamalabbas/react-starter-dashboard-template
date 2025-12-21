import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData } from "@/services/api";
import { BaseResponse } from "@/interface/baseResponse.interface";

export interface ApproveSponsorRequest {
  beneficiaryId: number;
  sponsorId: number;
}

export default function useApproveSponsor() {
  const qc = useQueryClient();
  return useMutation<BaseResponse<any>, Error, ApproveSponsorRequest>({
    mutationFn: (body: ApproveSponsorRequest) => postData<ApproveSponsorRequest, BaseResponse<any>>(`/Admin/Beneficiary/ApproveSponsor`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beneficiaries", "list"] });
    },
  });
}
