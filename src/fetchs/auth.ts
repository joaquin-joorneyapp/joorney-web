import { anonymousAxios } from '@/configs/axios';
import {
  LoginRequestForm,
  SignupRequestForm,
} from '@/types/fetchs/requests/auth';

export const login = (body: LoginRequestForm) =>
  anonymousAxios.post(`/auth/login`, {
    ...body,
  });

export const signup = (body: SignupRequestForm) =>
  anonymousAxios.post(`/auth/register`, {
    ...body,
  });

export const verifyEmail = (token: string) =>
  anonymousAxios.put(`/auth/verify/${token}`);

export const resetPassword = (body: { email: string }) =>
  anonymousAxios.post(`/auth/reset-password`, { ...body });

export const confirmPasswordReset = (body: {
  token: string;
  password: string;
}) => anonymousAxios.put(`/auth/reset-password/confirm`, { ...body });

export const registerWithGoogle = (body: { token: string }) =>
  anonymousAxios.post(`/auth/providers/google/register`, { ...body });
