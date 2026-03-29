import { useQuery } from "@tanstack/react-query";
import { BaseResponse } from "@/interface/baseResponse.interface";
import { getData } from "@/services/api";

export interface ActivityItem {
  id?: number;
  actionCode?: string;
  actionDescription?: string;
  entityTypeCode?: string;
  entityTypeDescription?: string;
  entityId?: number | string;
  description?: string;
  createdAt?: string;
  createdBy?: string;
  [key: string]: unknown;
}

interface GetUserActivitiesResponse {
  activityList?: ActivityItem[];
  activities?: ActivityItem[];
  items?: ActivityItem[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface UseActivityParams {
  userId?: number;
  pageNumber?: number;
  pageSize?: number;
  actionCode?: string;
  entityTypeCode?: string;
  dateFrom?: string;
  dateTo?: string;
  enabled?: boolean;
}

export interface ActivityQueryResult {
  activityList: ActivityItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const normalize = (
  response: BaseResponse<GetUserActivitiesResponse> | undefined,
  fallbackPageNumber: number,
  fallbackPageSize: number
): ActivityQueryResult => {
  const data = response?.data;
  const list = (data?.activityList ?? data?.activities ?? data?.items ?? []) as ActivityItem[];
  const totalCount = Number(data?.totalCount ?? list.length) || 0;
  const pageSize = Number(data?.pageSize ?? fallbackPageSize) || fallbackPageSize;
  const pageNumber = Number(data?.pageNumber ?? fallbackPageNumber) || fallbackPageNumber;
  const totalPages = Number(data?.totalPages ?? (pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1)) || 1;

  return {
    activityList: Array.isArray(list) ? list : [],
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
  };
};

const useActivity = ({
  userId,
  pageNumber = 1,
  pageSize = 50,
  actionCode,
  entityTypeCode,
  dateFrom,
  dateTo,
  enabled = true,
}: UseActivityParams) => {
  const userIdNum = Number(userId) || 0;
  const isEnabled = enabled && userIdNum > 0;

  return useQuery<BaseResponse<GetUserActivitiesResponse>, Error, ActivityQueryResult>({
    queryKey: [
      "UserActivities",
      userIdNum,
      pageNumber,
      pageSize,
      actionCode ?? "",
      entityTypeCode ?? "",
      dateFrom ?? "",
      dateTo ?? "",
    ],
    queryFn: () => {
      const params = new URLSearchParams({
        userId: String(userIdNum),
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
      });

      if (actionCode) params.append("actionCode", actionCode);
      if (entityTypeCode) params.append("entityTypeCode", entityTypeCode);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      return getData<BaseResponse<GetUserActivitiesResponse>>(`/Admin/Activity/GetUserActivities?${params.toString()}`);
    },
    select: (response) => normalize(response, pageNumber, pageSize),
    enabled: isEnabled,
    staleTime: 1000 * 60,
  });
};

export default useActivity;
