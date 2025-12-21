import { postData } from "@/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseResponse } from "@/interface/baseResponse.interface";

export interface UpdateFitraPaymentTypePayload {
  id?: number;
  code: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export default function useUpdateFitraPaymentType() {
  const qc = useQueryClient();
  return useMutation<BaseResponse<any>, Error, UpdateFitraPaymentTypePayload>({
    mutationFn: (body: UpdateFitraPaymentTypePayload) => postData<UpdateFitraPaymentTypePayload, BaseResponse<any>>(`/Admin/Fitra/UpdatePaymentType`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["paymentTypes", "fitra"] });
    },
  });
}
