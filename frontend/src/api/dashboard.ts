import axios from "axios";
import { API_BASE_URL } from "../config";

export async function fetchUrlsApi(token: string, page: number, limit: number) {
  return axios.get(`${API_BASE_URL}/api/urls`, {
    params: { page, limit },
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function submitUrlApi(token: string, url: string) {
  return axios.post(
    `${API_BASE_URL}/api/urls`,
    { url },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function bulkStartApi(token: string, ids: string[]) {
  return axios.put(
    `${API_BASE_URL}/api/urls/requeue`,
    { ids },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function bulkDeleteApi(token: string, ids: string[]) {
  return axios.delete(`${API_BASE_URL}/api/urls`, {
    data: { ids },
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function rowActionApi(
  token: string,
  action: "start" | "stop" | "requeue",
  id: string,
) {
  let url = "";
  let method: "put" | "post" = "put";
  let data: any = { ids: [id] };
  if (action === "start" || action === "requeue") {
    url = `${API_BASE_URL}/api/urls/requeue`;
    method = "put";
  } else if (action === "stop") {
    url = `${API_BASE_URL}/api/urls/stop`;
    method = "put";
    data = { ids: [id] };
  }
  return axios({
    url,
    method,
    data,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function stopUrlApi(token: string, ids: string | string[]) {
  const idArray = Array.isArray(ids) ? ids : [ids];
  return axios.put(
    `${API_BASE_URL}/api/urls/stop`,
    { ids: idArray },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}
