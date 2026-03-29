import { useQuery } from "@tanstack/react-query";
import { getHistoryPages } from "@/services/historyPageService";
import { HistoryPage } from "@/interface/historyPage.interface";

interface UseGetHistoryPagesOptions {
  enabled?: boolean;
}

export const useGetHistoryPages = (options?: UseGetHistoryPagesOptions) => {
  const { enabled = true } = options || {};

  const query = useQuery({
    queryKey: ["history-pages"],
    queryFn: async () => {
      const response = await getHistoryPages();

      // Support both API shapes:
      // 1) { historyPages: [...] }
      // 2) { data: { historyPages: [...] } }
      const raw = response as any;
      const pages = raw?.historyPages ?? raw?.data?.historyPages ?? [];
      return Array.isArray(pages) ? pages : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    enabled,
  });

  return {
    pages: (query.data || []) as HistoryPage[],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
