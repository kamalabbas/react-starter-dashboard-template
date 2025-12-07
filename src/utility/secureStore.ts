const REFRESH_TOKEN_KEY = "refresh_token";

export async function setRefreshToken(token: string) {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error("Failed to save refresh token:", error);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to read refresh token:", error);
    return null;
  }
}

export async function removeRefreshToken() {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to remove refresh token:", error);
  }
}
