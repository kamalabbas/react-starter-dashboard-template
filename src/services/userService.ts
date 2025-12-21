import { BaseResponse } from "@/interface/baseResponse.interface";
import { User, UserProfileResponse } from "@/interface/user.interface";
import { getData } from "@/services/apiClient";

const DEFAULT_GET_USER_ENDPOINT = "/FamilyTreeBe/GetUser";

export const getUserById = async (userId: string | number): Promise<BaseResponse<UserProfileResponse>> => {
  const endpoint = (import.meta.env.VITE_GET_USER_ENDPOINT as string | undefined) ?? DEFAULT_GET_USER_ENDPOINT;
  const id = typeof userId === "string" ? userId : String(userId);
  const url = endpoint.includes("?") ? `${endpoint}&userId=${encodeURIComponent(id)}` : `${endpoint}?userId=${encodeURIComponent(id)}`;
  return getData<BaseResponse<UserProfileResponse>>(url);
};

export const getUserDisplayName = (user?: User | null): string => {
  const profile: any = user?.userProfile;
  const first = String(profile?.firstName ?? "").trim();
  const family = String(profile?.familyName ?? "").trim();
  return `${first} ${family}`.trim();
};
