import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";

// Types
export interface FitraPaymentType {
  id: number;
  code: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  isEditable?: boolean;
}

export interface GetFitraPaymentTypesResponse {
  paymentTypeList: FitraPaymentType[];
}

const useGetFitraPaymentTypes = () => {
  return useQuery<BaseResponse<GetFitraPaymentTypesResponse>, Error, FitraPaymentType[]>({
    queryKey: ["paymentTypes", "fitra"],
    queryFn: () => getData<BaseResponse<GetFitraPaymentTypesResponse>>(`/FamilyTreeBe/Fitra/GetPaymentTypes?isActive=true`),
    select: (res) => res.data?.paymentTypeList ?? [],
    staleTime: 1000 * 60 * 10,
  });
};

export default useGetFitraPaymentTypes;
