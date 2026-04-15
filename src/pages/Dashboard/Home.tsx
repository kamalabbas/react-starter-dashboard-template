import { Navigate } from "react-router";
import useGetUserPermissions from "@/hooks/useGetUserPermissions";
import { hasPageAccess, hasConfigurationAccess } from "@/utility/pageAccess";

const ORDERED_ROUTES = [
  "/manage-users",
  "/create-announcements",
  "/event-live",
  "/manage-fitra",
  "/manage-zakat",
  "/manage-sadaqah",
  "/manage-aid",
  "/card-requests",
  "/balance-distribution",
  "/manage-sponsership",
  "/about-us",
  "/privacy-policy",
  "/biography-management",
  "/history-articles",
  "/configuration/payment-types",
  "/configuration/family-branches",
  "/configuration/ramadan",
];

export default function Home() {
  const { data: permissions, isLoading } = useGetUserPermissions();

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  const firstAccessible = ORDERED_ROUTES.find((path) =>
    path.startsWith("/configuration")
      ? hasConfigurationAccess(permissions)
      : hasPageAccess(path, permissions)
  );

  if (firstAccessible) {
    return <Navigate to={firstAccessible} replace />;
  }

  return <div className="p-6 text-sm text-gray-500 dark:text-gray-400">No accessible pages.</div>;
}
