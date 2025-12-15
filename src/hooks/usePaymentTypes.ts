import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export interface PaymentType {
  id: number;
  code: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  isEditable: boolean;
}

interface PaymentTypeListResponse {
  paymentTypeList: PaymentType[];
}

const usePaymentTypes = () => {
  return useQuery<BaseResponse<PaymentTypeListResponse>, Error, PaymentType[]>({
    queryKey: ["PaymentTypes"],
    queryFn: () => getData<BaseResponse<PaymentTypeListResponse>>("/FamilyTreeBe/GetPaymentTypes?isActive=true"),
    select: (res) => res.data?.paymentTypeList ?? [],
    staleTime: 1000 * 60 * 30
  });
};

export default usePaymentTypes;
