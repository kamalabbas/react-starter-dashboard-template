import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateHistoryPage, UpdateHistoryPagePayload } from "@/services/historyPageService";
import { useToastStore } from "@/stores/toastStore";

export const useUpdateHistoryPage = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  const mutation = useMutation({
    mutationFn: (payload: UpdateHistoryPagePayload) => updateHistoryPage(payload),
    onSuccess: (data) => {
      // Invalidate the pages list to refetch
      queryClient.invalidateQueries({ queryKey: ["history-pages"] });
      
      const isCreate = data.pageId === -1;
      showToast(
        isCreate ? "Article created successfully" : "Article updated successfully",
        "success"
      );
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to save article";
      showToast(message, "error");
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
