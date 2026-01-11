import React, { useEffect } from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { removeRefreshToken } from "@/utility/secureStore";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.showToast);

  const isAuthorized = !!accessToken && !!user && user.userRoleCode === "ADMIN_USER";

  useEffect(() => {
    if (accessToken && user && user.userRoleCode !== "ADMIN_USER") {
      showToast("Not authorized", "error");
      useAuthStore.getState().clearAuth();
      void removeRefreshToken();
    }
  }, [accessToken, user, showToast]);

  if (!isAuthorized) return <Navigate to="/signin" replace />;
  return <>{children}</>;
};

export default RequireAuth;
