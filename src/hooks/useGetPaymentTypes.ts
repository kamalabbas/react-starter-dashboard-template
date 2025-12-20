import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface PaymentType {
  id: number;
  code: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  isEditable?: boolean;
}

interface PaymentListResponse {
  paymentTypeList: PaymentType[];
}

const useGetPaymentTypes = () => {
  return useQuery<BaseResponse<PaymentListResponse>, Error, PaymentType[]>({
    queryKey: ["paymentTypes", "general"],
    queryFn: () => getData<BaseResponse<PaymentListResponse>>(`/FamilyTreeBe/GetPaymentTypes`),
    select: (res) => res.data?.paymentTypeList ?? [],
    staleTime: 1000 * 60 * 5,
  });
};

export default useGetPaymentTypes;
