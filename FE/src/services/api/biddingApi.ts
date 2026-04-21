import api from './axiosInstance';
import type { ApiResponse, Bid } from '@/types';

export const biddingApi = {
  getBiddingHistory: (userId: number) =>
    api.get<ApiResponse<Bid[]>>(`/alumni/${userId}/bids`),

  getBidStatus: (userId: number) =>
    api.get<ApiResponse<Bid | null>>(`/alumni/${userId}/bids/status`),

  placeBid: (userId: number, amount: number) =>
    api.post<ApiResponse<Bid>>(`/alumni/${userId}/bids`, { amount }),

  updateBid: (userId: number, bidId: number, amount: number) =>
    api.put<ApiResponse<Bid>>(`/alumni/${userId}/bids/${bidId}`, { amount }),

  cancelBid: (userId: number, bidId: number) =>
    api.patch<ApiResponse<null>>(`/alumni/${userId}/bids/${bidId}/cancel`),
};
