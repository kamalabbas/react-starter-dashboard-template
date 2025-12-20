import { postData } from "@/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseResponse } from "@/interface/baseResponse.interface";

export interface UpdateFitraPayload {
  fitraPaymentId: number;
  paymentStatus: string;
}

export default function useUpdateFitraStatus() {
  const qc = useQueryClient();
  return useMutation<BaseResponse<any>, Error, UpdateFitraPayload>({
    mutationFn: (body: UpdateFitraPayload) => postData<UpdateFitraPayload, BaseResponse<any>>(`/Admin/Fitra/UpdateFitraStatus`, body),
    onSuccess: () => {
      qc.invalidateQueries(["fitra", "payments"]);
    },
  });
}
