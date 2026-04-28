import type { ApiResponse, AuthUser } from "../../types/api";
import { apiClient } from "./client";

export async function getUserById(id: number) {
  const response = await apiClient.get<ApiResponse<AuthUser>>(`/api/users/${id}`);
  return response.data.data;
}

