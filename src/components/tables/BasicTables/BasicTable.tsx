import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right";
};

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  rowKey?: (row: T) => string | number;
  emptyMessage?: string;
  /** Enable basic client-side pagination with fixed page size (defaults to 15) */
  pagination?: {
    initialPage?: number;
    pageSize?: number; // fixed page size
  };
  /** Pass classes to the internal <table> element (use for min-width overrides). */
  tableClassName?: string;
}

function BasicTableInner<T>({
  columns,
  data,
  isLoading,
  isError,
  rowKey,
  emptyMessage = "No data available",
  pagination,
  tableClassName,
}: Props<T>) {
  const defaultPageSize = pagination?.pageSize ?? 15;
  const [page, setPage] = useState(pagination?.initialPage ?? 1);
  const [pageSize] = useState(defaultPageSize);

  // Enable pagination if data exceeds page size
  const enablePagination = Boolean(data && data.length > pageSize);

  // Ensure page is within bounds when data changes
  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.length ?? 0) / pageSize)), [data, pageSize]);
  if (page > totalPages) setPage(totalPages);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load data.</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-6 text-gray-500">{emptyMessage}</div>;
  }

  const pagedData = enablePagination
    ? data.slice((page - 1) * pageSize, page * pageSize)
    : data;

  const from = enablePagination ? (page - 1) * pageSize + 1 : 1;
  const to = enablePagination ? Math.min(page * pageSize, data.length) : data.length;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full">
        <div className="overflow-x-auto w-full">
          <Table className={tableClassName}>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  isHeader
                  key={col.key}
                  className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${col.headerClassName ?? ""}`} 
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {pagedData.map((row) => (
              <TableRow key={(rowKey ? rowKey(row) : (row as any).id) as React.Key}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={`px-5 py-3 text-gray-600 text-start text-theme-sm dark:text-gray-300 ${col.className ?? ""} ${col.align === "right" ? "text-right" : "text-left"}`}
                  >
                    {col.render ? col.render(row) : (row as any)[col.key] ?? "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      {enablePagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 dark:bg-white/[0.02] dark:border-white/[0.03]">
          <div className="text-sm text-gray-600 dark:text-gray-300">Showing {from} to {to} of {data.length}</div>

          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 rounded border border-gray-200 bg-white text-sm text-gray-800 disabled:opacity-50 dark:bg-transparent dark:text-gray-200 dark:border-white/[0.03]"
              >Prev</button>

              {/* Numeric page buttons */}
              {(() => {
                const delta = 3;
                let start = Math.max(1, page - delta);
                let end = Math.min(totalPages, page + delta);
                if (page <= delta) end = Math.min(totalPages, delta * 2 + 1);
                if (page + delta >= totalPages) start = Math.max(1, totalPages - delta * 2);
                const pages = [] as number[];
                for (let i = start; i <= end; i++) pages.push(i);

                const elems: React.ReactNode[] = [];
                if (start > 1) {
                  elems.push(
                    <button key={1} onClick={() => setPage(1)} className={`px-2 py-1 rounded text-sm ${page===1?"bg-indigo-600 text-white":"bg-white dark:bg-white/[0.03]"}`}>1</button>
                  );
                  if (start > 2) elems.push(<span key="s1" className="px-2">...</span>);
                }

                pages.forEach((p) => {
                  elems.push(
                    <button key={p} onClick={() => setPage(p)} className={`px-2 py-1 rounded text-sm border ${page===p?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-800 dark:bg-transparent dark:text-gray-200 border-gray-200 dark:border-white/[0.03]"}`}>{p}</button>
                  );
                });

                if (end < totalPages) {
                  if (end < totalPages - 1) elems.push(<span key="s2" className="px-2">...</span>);
                  elems.push(
                    <button key={totalPages} onClick={() => setPage(totalPages)} className={`px-2 py-1 rounded text-sm ${page===totalPages?"bg-indigo-600 text-white":"bg-white dark:bg-white/[0.03]"}`}>{totalPages}</button>
                  );
                }

                return elems;
              })()}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 rounded border border-gray-200 bg-white text-sm text-gray-800 disabled:opacity-50 dark:bg-transparent dark:text-gray-200 dark:border-white/[0.03]"
              >Next</button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BasicTable<T>(props: Props<T>) {
  return <BasicTableInner {...props} />;
}
