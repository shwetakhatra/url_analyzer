import axios from "axios";
import { API_BASE_URL } from "../config";

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupErrorResponse {
  errors?: Record<string, string>;
  message?: string;
}

export async function signupApi(data: Omit<SignupFormData, "confirmPassword">) {
  return axios.post<{ message: string }>(`${API_BASE_URL}/auth/register`, data);
}
