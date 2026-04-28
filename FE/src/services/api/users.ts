import axios from "axios";
import type { ApiResponse, AuthUser } from "../../types/api";
import { apiClient } from "./client";
import { getAccessToken } from "../../utils/tokenStorage";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getUserById(id: number, options?: { retryOnce?: boolean }) {
  const token = getAccessToken();
  const url = `/api/users/${id}`;

  console.debug("[users] getUserById", { userId: id, url, hasToken: Boolean(token) });

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid user id");
  }

  if (!token) {
    // Prevent invalid calls when not authenticated
    throw new Error("Not authenticated");
  }

  try {
    const response = await apiClient.get<ApiResponse<AuthUser>>(url);
    return response.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.debug("[users] getUserById error", {
        userId: id,
        url,
        status: err.response?.status,
        message: err.message,
        data: err.response?.data,
      });

      // Simple resilience: retry once on network/timeout (no HTTP response)
      if (!err.response && options?.retryOnce !== false) {
        await sleep(300);
        return getUserById(id, { retryOnce: false });
      }
    }
    throw err;
  }
}

