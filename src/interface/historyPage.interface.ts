export interface HistoryPage {
  pageId: number;
  title: string;
  thumbnailUrl: string;
  thumbnailFileName: string;
  contentHtml: string;
  statusCode: "DRAFT" | "PUBLISHED";
}

export interface GetHistoryPagesResponse {
  historyPages: HistoryPage[];
}
