import { User } from "./user.interface";

export interface Token {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest { 
  email: string;
  password: string;
}

export interface LoginResponse {
  email: string;
  token: Token;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  user: User;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailOtpResponse {
  user: User;
  token: Token;
}

export interface sendEmailOtpRequest {
  email: string;
}

export interface SendVerifyEmailResponse {}

export interface setNewPasswordRequest {
  newPassword: string;
  confirmPassword: string;
  forgotPasswordToken: string;
}

export interface setNewPasswordResponse { }

export interface sendForgotPasswordOtpRequest {
  email: string;
}

export interface SendForgotPasswordOtpResponse { }

export interface VerifyResetPasswordOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyResetPasswordOtpResponse { 
  forgotPasswordToken: string;
}

export interface refreshTokenRequest {
  refreshToken: string;
}

export interface refreshTokenResponse { 
  user: User;
  token: Token;
}

export interface LogoutRequest {
  refreshToken?: string;
  expoPushToken?: string;
}