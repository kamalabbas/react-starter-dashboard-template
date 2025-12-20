import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData } from "@/services/apiClient";
import { BaseResponse } from "@/interface/baseResponse.interface";

export interface ApproveAidRequest {
  askForAidId: number;
}

export default function useApproveAid() {
  const qc = useQueryClient();
  return useMutation<BaseResponse<any>, Error, ApproveAidRequest>({
    mutationFn: (body: ApproveAidRequest) => postData<ApproveAidRequest, BaseResponse<any>>(`/Admin/ApproveAid`, body),
    onSuccess: () => {
      qc.invalidateQueries(["AllAidRequests"]);
    },
  });
}
