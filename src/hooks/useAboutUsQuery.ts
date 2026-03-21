import { useQuery } from "@tanstack/react-query";
import { getData } from "@/services/api";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { GetAboutUsResponse } from "@/interface/aboutUs.interface";


export default function useGetAboutUs() {
  return useQuery<BaseResponse<GetAboutUsResponse>>({
    queryKey: ['about-us'],
    queryFn: () =>
      getData<BaseResponse<GetAboutUsResponse>>(
        "/Admin/Pages/GetAboutUs"
      ),
  });
}