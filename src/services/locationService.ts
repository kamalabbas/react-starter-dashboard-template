
import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "./api";

export interface GetCitiesParams {
  countryIso2: string;
  governorateId: number;
  districtId: number;
}

export interface RegionsData {
  countries: Country[];
  governorates: governorate[];
  districts: district[];
}
export interface Country {
  id: number;
  iso2: string;
  name: string;
}

export interface governorate {
    id: number;
    countryId: number;
    code: string;
    name: string;
}

export interface district {
    id: number;
    governorateId: number;
    code: string;
    name: string;
}

export interface RegionsData {
  countries: Country[];
  governorates: governorate[];
  districts: district[];
}

export interface Cities {
  id: number;
  districtId: number;
  code: string;
  name: string;
}
export interface CitiesResponse {
  cities: Cities[];
}


export const locationService = async (regionTypeList: string[]) => {
  const params = regionTypeList?.map((regionType) => `regionTypeList=${encodeURIComponent(regionType)}`).join("&");
  return await getData<BaseResponse<RegionsData>>(`/FamilyTreeBe/GetRegions?${params}`);
};

// Remove undefined/null from params
const cleanParams = <T extends Record<string, any>>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)) as Partial<T>;

export const GetCities = async (params: GetCitiesParams) => {
  return await getData<BaseResponse<CitiesResponse>>("/FamilyTreeBe/GetCities", { params: cleanParams(params) });
};
