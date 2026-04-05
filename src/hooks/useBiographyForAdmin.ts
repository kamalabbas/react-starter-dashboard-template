import { BaseResponse } from "@/interface/baseResponse.interface";
import { BiographyWorkspace, GetBiographyForAdminResponse } from "@/interface/biography.interface";
import { getBiographyForAdmin } from "@/services/biographyService";
import { useQuery } from "@tanstack/react-query";

export default function useBiographyForAdmin(userId: number | null) {
  return useQuery<BaseResponse<GetBiographyForAdminResponse>, Error, BiographyWorkspace>({
    queryKey: ["biography", "workspace", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await getBiographyForAdmin(userId);
      return response;
    },
    select: (response) => response.data?.biography ?? { approvedBiography: null, workingBiography: null },
    enabled: userId !== null,
    staleTime: 1000 * 30,
  });
}
