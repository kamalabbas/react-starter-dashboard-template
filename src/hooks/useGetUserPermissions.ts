import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";

interface UserPermissionsResponse {
  permissionCodeList?: string[];
  permissions?: string[];
}

const normalizePermissions = (payload: unknown): string[] => {
  if (Array.isArray(payload)) {
    return payload.map((item) => String(item ?? "")).filter(Boolean);
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const raw = payload as UserPermissionsResponse;
  const list = raw.permissionCodeList ?? raw.permissions ?? [];
  return list.map((item) => String(item ?? "")).filter(Boolean);
};

const useGetUserPermissions = () => {
  return useQuery<BaseResponse<UserPermissionsResponse | string[]>, Error, string[]>({
    queryKey: ["auth", "permissions", "current-user"],
    queryFn: () => getData<BaseResponse<UserPermissionsResponse | string[]>>(`/Auth/GetUserPermissions`),
    select: (res) => normalizePermissions(res.data),
    staleTime: 1000 * 60 * 2,
  });
};

export default useGetUserPermissions;
