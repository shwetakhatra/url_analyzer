import axios from "axios";
import { API_BASE_URL } from "../config";

export type LoginFormData = {
  email: string;
  password: string;
};

export type LoginErrorResponse = {
  errors?: Record<string, string>;
  message?: string;
};

export async function loginApi(data: LoginFormData) {
  return axios.post<{ token: string }>(`${API_BASE_URL}/auth/login`, data);
}
