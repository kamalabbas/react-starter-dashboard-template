import { postData } from "@/services/apiClient";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdateMobileFeatureAccessPayload {
  featureId: number;
  isEnabled: boolean;
}

export default function useUpdateMobileFeatureAccess() {
  const qc = useQueryClient();
  return useMutation<BaseResponse<unknown>, Error, UpdateMobileFeatureAccessPayload>({
    mutationFn: (body: UpdateMobileFeatureAccessPayload) =>
      postData<UpdateMobileFeatureAccessPayload, BaseResponse<unknown>>(
        "/Admin/Features/UpdateMobileFeatureAccess",
        body
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mobileFeatures"] });
    },
  });
}
