import React from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/signin" replace />;
  return <>{children}</>;
};

export default RequireAuth;
