import { useNavigate } from "react-router";
import { logout } from "@/services/authService";
import { removeRefreshToken, getRefreshToken } from "@/utility/secureStore";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";

export default function UserDropdown() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const profile = user?.userProfile;

  const avatarSrc = profile?.profilePicUrl || "/images/user/user-01.jpg";
  const displayName = (
    `${profile?.firstName ?? ""} ${profile?.familyName ?? ""}`.trim() ||
    user?.email ||
    "User"
  );

  const handleLogout = async () => {
    try {
      const refresh = await getRefreshToken();
      if (refresh) {
        await logout({ refreshToken: refresh });
      } else {
        await logout();
      }
    } catch (err) {
      // ignore server error but continue clearing local state
      console.warn("Logout API failed:", err);
    }
    try {
      await removeRefreshToken();
    } catch (err) {
      console.warn("Failed to remove refresh token:", err);
    }
    useAuthStore.getState().clearAuth();
    useToastStore.getState().showToast("Signed out", "success");
    navigate("/signin");
  };
  return (
    <div className="flex items-center gap-3">
      <span className="overflow-hidden rounded-full h-11 w-11 bg-gray-100 dark:bg-gray-800">
        <img
          src={avatarSrc}
          alt={displayName}
          className="h-11 w-11 object-cover"
        />
      </span>

      <span className="hidden sm:block font-medium text-theme-sm text-gray-700 dark:text-gray-300">
        {displayName}
      </span>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
      >
        Log out
      </button>
    </div>
  );
}
