import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData } from "@/services/apiClient";
import { BaseResponse } from "@/interface/baseResponse.interface";

export interface UpdateSadakaStatusRequest {
  sadakaId: number;
  paymentStatus: string;
}

export default function useUpdateSadakaStatus() {
  const qc = useQueryClient();
  return useMutation<BaseResponse<any>, Error, UpdateSadakaStatusRequest>({
    mutationFn: (body: UpdateSadakaStatusRequest) =>
      postData<UpdateSadakaStatusRequest, BaseResponse<any>>(`/Admin/Fitra/UpdateSadakaStatus`, body),
    onSuccess: () => {
      qc.invalidateQueries(["sadaka", "list"]);
    },
  });
}
