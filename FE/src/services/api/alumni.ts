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
import { isDevBypassEnabled } from "../../utils/devMode";
import {
  devAlumniDetails,
  devAlumniProfiles,
  getDevAppearanceCount,
  getDevBids,
  getDevMonthlyLimit,
  getDevTomorrowSlot,
  setDevBids,
} from "../../data/devMock";

function wait(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAlumniList() {
  if (isDevBypassEnabled()) {
    await wait();
    return [...devAlumniProfiles];
  }
  const response = await apiClient.get<ApiResponse<AlumniProfile[]>>("/api/alumni");
  return response.data.data;
}

export async function getAlumniProfile(userId: number) {
  if (isDevBypassEnabled()) {
    await wait();
    const profile = devAlumniDetails[userId];
    if (!profile) {
      throw new Error("Dev alumni profile not found");
    }
    return JSON.parse(JSON.stringify(profile)) as AlumniFullProfile;
  }
  const response = await apiClient.get<ApiResponse<AlumniFullProfile>>(`/api/alumni/${userId}`);
  return response.data.data;
}

export async function getBiddingHistory(userId: number) {
  if (isDevBypassEnabled()) {
    await wait();
    return getDevBids().filter((bid) => bid.user_id === userId).sort((a, b) => b.id - a.id);
  }
  const response = await apiClient.get<ApiResponse<BidRecord[]>>(`/api/alumni/${userId}/bids`);
  return response.data.data;
}

export async function getBidStatus(userId: number) {
  if (isDevBypassEnabled()) {
    await wait();
    const bids = getDevBids()
      .filter((bid) => bid.user_id === userId)
      .sort((a, b) => b.id - a.id);
    return bids[0] || null;
  }
  const response = await apiClient.get<ApiResponse<BidRecord | null>>(`/api/alumni/${userId}/bids/status`);
  return response.data.data;
}

export async function placeBid(userId: number, amount: number) {
  if (isDevBypassEnabled()) {
    await wait();
    const bids = getDevBids();
    const nextId = bids.reduce((max, bid) => Math.max(max, bid.id), 0) + 1;
    const now = new Date().toISOString();
    const newBid: BidRecord = {
      id: nextId,
      user_id: userId,
      amount: amount.toFixed(2),
      status: "pending",
      created_at: now,
      updated_at: now,
    };
    setDevBids([newBid, ...bids]);
    return newBid;
  }
  const response = await apiClient.post<ApiResponse<BidRecord>>(`/api/alumni/${userId}/bids`, { amount });
  return response.data.data;
}

export async function updateBid(userId: number, bidId: number, amount: number) {
  if (isDevBypassEnabled()) {
    await wait();
    const bids = getDevBids();
    let updated: BidRecord | null = null;
    const next = bids.map((bid) => {
      if (bid.user_id === userId && bid.id === bidId) {
        updated = { ...bid, amount: amount.toFixed(2), updated_at: new Date().toISOString() };
        return updated;
      }
      return bid;
    });
    if (!updated) {
      throw new Error("Dev bid not found");
    }
    setDevBids(next);
    return updated;
  }
  const response = await apiClient.put<ApiResponse<BidRecord>>(`/api/alumni/${userId}/bids/${bidId}`, { amount });
  return response.data.data;
}

export async function cancelBid(userId: number, bidId: number) {
  if (isDevBypassEnabled()) {
    await wait();
    const bids = getDevBids();
    const next = bids.map((bid) =>
      bid.user_id === userId && bid.id === bidId
        ? { ...bid, status: "cancelled", updated_at: new Date().toISOString() }
        : bid,
    );
    setDevBids(next);
    return;
  }
  return apiClient.patch(`/api/alumni/${userId}/bids/${bidId}/cancel`);
}

export async function getAppearanceCount(userId: number) {
  if (isDevBypassEnabled()) {
    await wait();
    void userId;
    return getDevAppearanceCount();
  }
  const response = await apiClient.get<ApiResponse<AppearanceCount>>(`/api/alumni/${userId}/appearance-count`);
  return response.data.data;
}

export async function getMonthlyLimit(userId: number) {
  if (isDevBypassEnabled()) {
    await wait();
    void userId;
    return getDevMonthlyLimit();
  }
  const response = await apiClient.get<ApiResponse<MonthlyLimit>>(`/api/alumni/${userId}/monthly-limit`);
  return response.data.data;
}

export async function getTomorrowSlot() {
  if (isDevBypassEnabled()) {
    await wait();
    return getDevTomorrowSlot();
  }
  const response = await apiClient.get<ApiResponse<SlotStatus>>("/api/alumni/slots/tomorrow");
  return response.data.data;
}

export interface CreateOrUpdateProfileData {
  first_name: string;
  last_name: string;
  bio?: string;
  programme?: string;
  graduation_year?: number;
  graduation_date?: string;
  degree?: string;
  industry_sector?: string;
  geography?: string;
  current_position?: string;
  linkedin_url?: string;
}

export async function createOrUpdateProfile(userId: number, data: CreateOrUpdateProfileData) {
  if (isDevBypassEnabled()) {
    await wait();
    // Update dev mock data
    console.log("[Dev] Create/Update Profile:", data);
    return data;
  }
  const response = await apiClient.post<ApiResponse<AlumniProfile>>(
    `/api/alumni/${userId}/profile`,
    data
  );
  return response.data.data;
}
