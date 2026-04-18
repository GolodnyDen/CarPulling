export type Role = 'guest' | 'passenger' | 'driver' | 'admin';


export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  rating?: number;
  createdAt?: string;
}

export interface Ride {
  id: string;
  driverId: string;
  driverName?: string;
  driverAvatar?: string | null;
  driverRating?: number;
  from: string;
  to: string;
  dateTime: string;
  seatsAvailable: number;
  seatsTotal: number;
  passengers: string[];
  routeImage?: string | null;
  description?: string;
  createdAt?: string;
}

export interface RideFilters {
  search?: string;
  from?: string;
  to?: string;
  driverId?: string;
  minSeats?: number;
  maxSeats?: number;
  dateFrom?: string;
  dateTo?: string;
  driverRole?: Role;
  sortBy?: RideSortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export type RideSortField = 'dateTime' | 'seatsAvailable' | 'from' | 'to' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  sortBy?: RideSortField;
  sortOrder?: SortOrder;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RideQueryParams extends RideFilters, SortParams, PaginationParams {}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
  filters?: RideFilters;
}

export type ApiListResult<T> = PaginatedResponse<T> | ApiError;

export interface SerializableFilters {
  search?: string;
  from?: string;
  to?: string;
  driverId?: string;
  minSeats?: number;
  maxSeats?: number;
  dateFrom?: string;
  dateTo?: string;
  driverRole?: Role;
  sortBy?: RideSortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationErrorResponse extends ApiError {
  errors?: ValidationError[];
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type SafeUser = Omit<User, 'password'>;

export interface UploadFormData {
  file: File;
  entityType: 'user' | 'ride';
  entityId: string;
  field: 'avatar' | 'routeImage';
}