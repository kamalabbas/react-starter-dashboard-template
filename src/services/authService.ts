import { refreshTokenRequest, refreshTokenResponse } from "../interface/auth.interface";
import { BaseResponse } from "../interface/baseResponse.interface";
import { postData } from "./apiClient";


export const refreshToken = (body: refreshTokenRequest) => {
    return postData<refreshTokenRequest, BaseResponse<refreshTokenResponse>>("/Auth/Refresh", body);
};
