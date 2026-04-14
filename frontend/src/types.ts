export type Role = 'guest' | 'passenger' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface Ride {
  id: string;
  driverId: string;
  driverName?: string;
  from: string;
  to: string;
  dateTime: string;
  seatsAvailable: number;
  passengers: string[];
  createdAt?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;