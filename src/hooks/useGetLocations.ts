import { useQuery } from "@tanstack/react-query";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { RegionTypeList } from "@/interface/enums";
import { Cities, CitiesResponse, RegionsData } from "@/interface/location.interface";
import { GetCities, locationService } from "@/services/locationService";

export const useGetLocations = (regionTypeList: RegionTypeList[]) => {
  const key = regionTypeList.slice().sort().join("|");
  return useQuery<BaseResponse<RegionsData>, Error, BaseResponse<RegionsData>>({
    queryKey: ["Locations", key],
    queryFn: () => locationService(regionTypeList),
    staleTime: 1000 * 60 * 60,
  });
};

export const useCities = (countryIso2?: string, governorateId?: number, districtId?: number) => {
  const iso = (countryIso2 ?? "").toString().toUpperCase();
  const govId = Number(governorateId) || 0;
  const distId = Number(districtId) || 0;
  const isSelected = Boolean(iso && govId > 0 && distId > 0);

  return useQuery<BaseResponse<CitiesResponse>, Error, Cities[]>({
    queryKey: ["Cities", isSelected ? iso : "", isSelected ? govId : 0, isSelected ? distId : 0],
    queryFn: () => GetCities({ countryIso2: iso, governorateId: govId, districtId: distId }),
    enabled: isSelected,
    select: (resp) => resp.data?.cities ?? [],
    staleTime: 1000 * 60 * 30,
  });
};
