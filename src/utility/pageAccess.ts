const PAGE_PERMISSION_MAP: Record<string, string[]> = {
  "/manage-users": ["MANAGE_USERS"],
  "/create-announcements": ["ANNOUNCEMENTS"],
  "/manage-fitra": ["MANAGE_FEATURES_FITRA"],
  "/manage-zakat": ["MANAGE_FEATURES_ZAKAT"],
  "/manage-sadaqah": ["MANAGE_FEATURES_SADAQAH"],
  "/manage-aid": ["MANAGE_FEATURES_AID"],
  "/card-requests": ["MANAGE_FEATURES_CARD_REQUESTS"],
  "/balance-distribution": ["MANAGE_FEATURES_BALANCE_DISTRIBUTION"],
  "/manage-sponsership": ["MANAGE_FEATURES_SPONSORSHIP"],
  "/about-us": ["MANAGE_PAGES_ABOUT_US"],
  "/privacy-policy": ["MANAGE_PAGES_PRIVACY_POLICY"],
  "/biography-management": ["MANAGE_PAGES_BIOGRAPHY_MANAGEMENT"],
  "/history-articles": ["MANAGE_PAGES_HISTORY_ARTICLES"],
  "/configuration/payment-types": ["MANAGE_CONFIGURATION_PAYMENT_TYPES"],
  "/configuration/family-branches": ["MANAGE_CONFIGURATION_FAMILY_BRANCHES"],
  "/configuration/ramadan": ["MANAGE_CONFIGURATION_RAMADAN_CONFIGURATION"],
};

const normalize = (value: string) => value.trim().toUpperCase();

const resolvePathKey = (path: string): string => {
  if (path.startsWith("/manage-users/")) return "/manage-users";
  if (path.startsWith("/history-articles/")) return "/history-articles";
  return path;
};

export const hasPageAccess = (path: string, permissionCodes: string[] | undefined): boolean => {
  const pathKey = resolvePathKey(path);

  // Live Event is intentionally open to any authenticated role.
  if (pathKey === "/event-live") return true;

  const userCodes = (permissionCodes ?? []).map((code) => normalize(String(code ?? ""))).filter(Boolean);

  // Product rule: empty user permission/activity list means full access.
  if (userCodes.length === 0) return true;

  const requiredCodes = PAGE_PERMISSION_MAP[pathKey] ?? [];

  // Product rule: when list is not empty, pages with no mapped permission are not accessible.
  if (requiredCodes.length === 0) return false;

  return requiredCodes.some((code) => userCodes.includes(normalize(code)));
};

export const isMappedPage = (path: string): boolean => {
  const pathKey = resolvePathKey(path);
  return Boolean(PAGE_PERMISSION_MAP[pathKey]);
};

export const hasConfigurationAccess = (permissionCodes: string[] | undefined): boolean => {
  const userCodes = (permissionCodes ?? []).map((code) => normalize(String(code ?? ""))).filter(Boolean);
  if (userCodes.length === 0) return true;

  return [
    "MANAGE_CONFIGURATION_PAYMENT_TYPES",
    "MANAGE_CONFIGURATION_FAMILY_BRANCHES",
    "MANAGE_CONFIGURATION_RAMADAN_CONFIGURATION",
  ].some((code) => userCodes.includes(code));
};
