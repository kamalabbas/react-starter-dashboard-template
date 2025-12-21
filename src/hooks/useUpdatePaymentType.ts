import { postData } from "@/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseResponse } from "@/interface/baseResponse.interface";

export interface UpdatePaymentTypePayload {
  id?: number;
  code: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export default function useUpdatePaymentType() {
  const qc = useQueryClient();
  return useMutation<BaseResponse<any>, Error, UpdatePaymentTypePayload>({
    mutationFn: (body: UpdatePaymentTypePayload) => postData<UpdatePaymentTypePayload, BaseResponse<any>>(`/Admin/UpdatePaymentType`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["paymentTypes", "general"] });
    },
  });
}
