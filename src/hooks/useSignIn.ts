import { useMutation } from "@tanstack/react-query";
import { signIn } from "@/services/authService";
import { LoginRequest } from "@/interface/auth.interface";
import { useAuthStore } from "@/stores/authStore";
import { setRefreshToken } from "@/utility/secureStore";
import { useToastStore } from "@/stores/toastStore";

const useSignIn = () => {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const showToast = useToastStore((s) => s.showToast);

  return useMutation({
    mutationFn: (body: LoginRequest) => signIn(body),
    onSuccess: async (res) => {
      const payload = res.data;
      if (!payload) return;
      const token = payload.token;
      await setRefreshToken(token.refreshToken);
      setAccessToken(token.accessToken);
      setUser(payload.user);
      showToast("Signed in", "success");
    },
    onError: (err: any) => {
      showToast(err?.message ?? "Sign in failed", "error");
    },
  });
};

export default useSignIn;
