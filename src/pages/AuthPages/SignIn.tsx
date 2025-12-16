import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useAuthStore } from "@/stores/authStore";
import { Navigate } from "react-router";

export default function SignIn() {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (accessToken) return <Navigate to="/" replace />;
  return (
    <>
      <AuthLayout showSide={false}>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
