import api from './api';
import type { Ride, RideQueryParams, PaginatedResponse, User } from '../types';

export const rideService = {
  getRides: async (params: RideQueryParams) => {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== '') acc[k] = String(v);
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    
    const res = await api.get<PaginatedResponse<Ride>>(`/rides?${queryString}`);
    return res.data;
  },

  getRideById: async (id: string) => {
    const res = await api.get<Ride>(`/rides/${id}`);
    return res.data;
  },

  createRide: async (ride: Partial<Ride>) => {
    const res = await api.post<Ride>('/rides', ride);
    return res.data;
  },

  updateRide: async (id: string, updates: Partial<Ride>) => {
    const res = await api.put<Ride>(`/rides/${id}`, updates);
    return res.data;
  },

  deleteRide: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/rides/${id}`);
    return res.data;
  },

  joinRide: async (id: string, userId: string) => {
    const res = await api.post<Ride>(`/rides/${id}/join`, { userId });
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get<User>('/me');
    return res.data;
  },

  updateUser: async (updates: Partial<User>) => {
    const res = await api.put<User>('/me', updates);
    return res.data;
  },

  deleteUser: async () => {
    const res = await api.delete<{ message: string }>('/me');
    return res.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post<{ avatar: string }>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  uploadRideImage: async (rideId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post<{ routeImage: string }>(`/rides/${rideId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteFile: async (filename: string) => {
    const res = await api.delete<{ message: string }>(`/api/files/${filename}`);
    return res.data;
  },
};