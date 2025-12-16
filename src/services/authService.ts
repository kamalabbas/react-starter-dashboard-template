import { refreshTokenRequest, refreshTokenResponse } from "../interface/auth.interface";
import { BaseResponse } from "../interface/baseResponse.interface";
import { postData } from "./apiClient";


export const refreshToken = (body: refreshTokenRequest) => {
    return postData<refreshTokenRequest, BaseResponse<refreshTokenResponse>>("/Auth/Refresh", body);
};

import { LoginRequest, LoginResponse } from "../interface/auth.interface";

export const signIn = (body: LoginRequest) => {
    return postData<LoginRequest, BaseResponse<LoginResponse>>("/Auth/SignIn", body);
};

import { LogoutRequest } from "../interface/auth.interface";

export const logout = (body?: LogoutRequest) => {
    // Best-effort server logout; callers should still clear local tokens regardless of outcome
    return postData<LogoutRequest, BaseResponse<any>>("/Auth/Logout", body ?? {});
};
