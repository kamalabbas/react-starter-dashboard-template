import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useGetHistoryPages } from "@/hooks/useGetHistoryPages";

export default function HistoryArticles() {
  const navigate = useNavigate();
  const { pages, isLoading, error } = useGetHistoryPages();

  const sortedArticles = useMemo(
    () => [...pages].sort((a, b) => new Date(b.thumbnailFileName).getTime() - new Date(a.thumbnailFileName).getTime()),
    [pages]
  );

  return (
    <div className="p-6">
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-900 p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">History Articles</h1>
          <button
            onClick={() => navigate("/history-articles/new")}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Create Article
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Loading articles...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
            Failed to load articles. Please try again.
          </div>
        )}

        {!isLoading && !error && sortedArticles.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-600 dark:text-gray-300">
            No articles yet. Create your first article.
          </div>
        )}

        {!isLoading && !error && sortedArticles.length > 0 && (
          <div className="space-y-3">
            {sortedArticles.map((article) => (
              <button
                key={article.pageId}
                type="button"
                className="w-full text-left rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-400 dark:hover:border-blue-500 transition flex gap-4"
                onClick={() => navigate(`/history-articles/${article.pageId}`)}
              >
                {article.thumbnailUrl && (
                  <img
                    src={article.thumbnailUrl}
                    alt={article.title}
                    className="w-20 h-20 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{article.title}</h3>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          article.statusCode === "PUBLISHED"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                        }`}
                      >
                        {article.statusCode}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                    {article.contentHtml || "No content"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
