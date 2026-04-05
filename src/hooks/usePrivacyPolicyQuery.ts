import { useQuery } from "@tanstack/react-query";
import { getData } from "@/services/api";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { GetPrivacyPolicyResponse } from "@/interface/privacyPolicy.interface";

export default function usePrivacyPolicyQuery() {
  return useQuery<BaseResponse<GetPrivacyPolicyResponse>>({
    queryKey: ["privacy-policy"],
    queryFn: () => getData<BaseResponse<GetPrivacyPolicyResponse>>("/Admin/Pages/GetPrivacyPolicy"),
  });
}
