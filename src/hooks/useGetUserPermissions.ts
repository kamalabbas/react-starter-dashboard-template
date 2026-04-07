import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";

interface UserPermissionsResponse {
  permissionCodeList?: string[];
  permissions?: string[];
  userPermissions?: string[];
}

interface UseGetUserPermissionsOptions {
  enabled?: boolean;
}

const normalizePermissions = (payload: unknown): string[] => {
  if (Array.isArray(payload)) {
    return payload.map((item) => String(item ?? "")).filter(Boolean);
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const raw = payload as UserPermissionsResponse;
  const list = raw.userPermissions ?? raw.permissionCodeList ?? raw.permissions ?? [];
  return list.map((item) => String(item ?? "")).filter(Boolean);
};

const useGetUserPermissions = (userId?: number, options?: UseGetUserPermissionsOptions) => {
  return useQuery<BaseResponse<UserPermissionsResponse | string[]>, Error, string[]>({
    queryKey: ["auth", "permissions", userId ?? "current-user"],
    queryFn: () =>
      getData<BaseResponse<UserPermissionsResponse | string[]>>(`/Auth/GetUserPermissions`, {
        params: userId ? { userId } : undefined,
      }),
    select: (res) => normalizePermissions(res.data),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 2,
  });
};

export default useGetUserPermissions;
