
import { AxiosError } from "axios";
import { getRefreshToken, setRefreshToken } from "./secureStore";
import { refreshTokenRequest } from "../interface/auth.interface";
import { refreshToken } from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { ErrorResponse } from "../interface/ErrorResponse.interface";

export async function restoreUser() {
    const storedRefreshToken = await getRefreshToken();

    if (!storedRefreshToken) return;

    try {
        const payload: refreshTokenRequest = { refreshToken: storedRefreshToken };

        const res = await refreshToken(payload);
        
        if (res.data?.token && res.data.user) {
            useAuthStore.setState({
                accessToken: res.data.token.accessToken,
                user: res.data.user,                
            });
            setRefreshToken(res.data.token.refreshToken);
        } else {
            console.log("Invalid refresh token response:", res);            
            useAuthStore.setState({ accessToken: null, user: null });
        }
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.log(axiosError.response?.data);
        useAuthStore.setState({ accessToken: null, user: null });
    }
}
