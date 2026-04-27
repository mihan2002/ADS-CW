import { apiClient } from "./client";
import type {
  AlumniFullProfile,
  AlumniProfile,
  ApiResponse,
  AppearanceCount,
  BidRecord,
  MonthlyLimit,
  SlotStatus,
} from "../../types/api";

export async function getAlumniList() {
  const response = await apiClient.get<ApiResponse<AlumniProfile[]>>("/api/alumni");
  return response.data.data;
}

export async function getAlumniProfile(userId: number) {
  const response = await apiClient.get<ApiResponse<AlumniFullProfile>>(`/api/alumni/${userId}`);
  return response.data.data;
}

export async function getBiddingHistory(userId: number) {
  const response = await apiClient.get<ApiResponse<BidRecord[]>>(`/api/alumni/${userId}/bids`);
  return response.data.data;
}

export async function getBidStatus(userId: number) {
  const response = await apiClient.get<ApiResponse<BidRecord | null>>(`/api/alumni/${userId}/bids/status`);
  return response.data.data;
}

export async function placeBid(userId: number, amount: number) {
  const response = await apiClient.post<ApiResponse<BidRecord>>(`/api/alumni/${userId}/bids`, { amount });
  return response.data.data;
}

export async function updateBid(userId: number, bidId: number, amount: number) {
  const response = await apiClient.put<ApiResponse<BidRecord>>(`/api/alumni/${userId}/bids/${bidId}`, { amount });
  return response.data.data;
}

export async function cancelBid(userId: number, bidId: number) {
  return apiClient.patch(`/api/alumni/${userId}/bids/${bidId}/cancel`);
}

export async function getAppearanceCount(userId: number) {
  const response = await apiClient.get<ApiResponse<AppearanceCount>>(`/api/alumni/${userId}/appearance-count`);
  return response.data.data;
}

export async function getMonthlyLimit(userId: number) {
  const response = await apiClient.get<ApiResponse<MonthlyLimit>>(`/api/alumni/${userId}/monthly-limit`);
  return response.data.data;
}

export async function getTomorrowSlot() {
  const response = await apiClient.get<ApiResponse<SlotStatus>>("/api/alumni/slots/tomorrow");
  return response.data.data;
}
