import { useQuery } from "@tanstack/react-query";
import { getData } from "@/services/api";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { Beneficiary, GetBeneficiariesResponse } from "@/interface/beneficiary.interface";

const useGetBeneficiaries = () => {
  return useQuery<BaseResponse<GetBeneficiariesResponse>, Error, Beneficiary[]>({
    queryKey: ["beneficiaries", "list"],
    queryFn: () => getData<BaseResponse<GetBeneficiariesResponse>>(`/FamilyTreeBe/Beneficiary/GetBeneficiaries?withUnsponsored=false&includePending=true`),
    select: (res) => res.data?.beneficiaries ?? [],
    staleTime: 1000 * 60 * 2,
  });
};

export default useGetBeneficiaries;
