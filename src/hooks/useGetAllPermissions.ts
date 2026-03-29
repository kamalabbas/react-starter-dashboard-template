import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface PermissionDefinition {
  id?: number;
  code: string;
  name?: string;
  description?: string;
}

interface PermissionCatalogResponse {
  permissionList?: PermissionDefinition[];
  permissions?: PermissionDefinition[];
}

const useGetAllPermissions = () => {
  return useQuery<BaseResponse<PermissionCatalogResponse | PermissionDefinition[]>, Error, PermissionDefinition[]>({
    queryKey: ["auth", "permissions", "all"],
    queryFn: () => getData<BaseResponse<PermissionCatalogResponse | PermissionDefinition[]>>(`/Auth/GetAllPermissions`),
    select: (res) => {
      const data = res.data;
      if (Array.isArray(data)) {
        return data.filter((item) => !!item?.code);
      }

      const permissionList = data?.permissionList ?? data?.permissions ?? [];
      return permissionList.filter((item) => !!item?.code);
    },
    staleTime: 1000 * 60 * 10,
  });
};

export default useGetAllPermissions;
