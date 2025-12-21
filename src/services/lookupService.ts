import { getData } from "@/services/apiClient";
import { LookupDomain } from "@/interface/enums";
import { BaseResponse } from "@/interface/baseResponse.interface";

export type LookupItem = {
  domain?: string | LookupDomain;
  code?: string;
  name?: string;
  label?: string;
  value?: string;
  description?: string;
  displayName?: string;
  lookupCode?: string;
};

export type LookupsResponse = {
  lookupList?: LookupItem[];
};

export const getLookups = async (domainList: string[]) => {
  const params = domainList?.map((domain) => `domainList=${encodeURIComponent(domain)}`).join("&");
    return await getData<BaseResponse<LookupsResponse>>(`/FamilyTreeBe/GetLookupsByDomain?${params}`);
};

