export type HistoryArticle = {
  id: number;
  title: string;
  contentHtml: string;
  createdAt: string;
  updatedAt: string;
};

export const HISTORY_ARTICLES_STORAGE_KEY = "history-articles-local";

const makeDefaultArticles = (): HistoryArticle[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 1,
      title: "Our Family Story Begins",
      contentHtml: "<p>Write your first history article here.</p>",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      title: "Important Milestone",
      contentHtml: "<p>Add milestones, events, and stories for your community.</p>",
      createdAt: now,
      updatedAt: now,
    },
  ];
};

export const loadHistoryArticles = (): HistoryArticle[] => {
  const raw = localStorage.getItem(HISTORY_ARTICLES_STORAGE_KEY);
  if (!raw) return makeDefaultArticles();

  try {
    const parsed = JSON.parse(raw) as HistoryArticle[];
    if (!Array.isArray(parsed) || parsed.length === 0) return makeDefaultArticles();
    return parsed;
  } catch {
    return makeDefaultArticles();
  }
};

export const saveHistoryArticles = (articles: HistoryArticle[]) => {
  localStorage.setItem(HISTORY_ARTICLES_STORAGE_KEY, JSON.stringify(articles));
};
