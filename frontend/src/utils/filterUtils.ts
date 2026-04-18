import type { SerializableFilters, RideSortField, SortOrder, Role } from '../types';

const NUMERIC_KEYS = ['minSeats', 'maxSeats', 'page', 'limit'] as const;
const STRING_KEYS = ['search', 'from', 'to', 'driverId', 'dateFrom', 'dateTo'] as const;

export const filtersToQuery = (filters: SerializableFilters): URLSearchParams => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  return params;
};

export const queryToFilters = (query: URLSearchParams): SerializableFilters => {
  const filters: SerializableFilters = {};
  
  NUMERIC_KEYS.forEach((key) => {
    const value = query.get(key);
    if (value !== null) {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        (filters[key] as number) = num;
      }
    }
  });
  
  STRING_KEYS.forEach((key) => {
    const value = query.get(key);
    if (value !== null && value !== '') {
      (filters[key] as string) = value;
    }
  });
  
  const sortBy = query.get('sortBy');
  if (sortBy && isValidSortField(sortBy)) {
    filters.sortBy = sortBy;
  }
  
  const sortOrder = query.get('sortOrder');
  if (sortOrder && isValidSortOrder(sortOrder)) {
    filters.sortOrder = sortOrder;
  }
  
  const driverRole = query.get('driverRole');
  if (driverRole && isValidRole(driverRole)) {
    filters.driverRole = driverRole;
  }
  
  return filters;
};

export const updateUrlFilters = (
  filters: SerializableFilters,
  navigate: (to: string, opts?: { replace?: boolean }) => void
) => {
  const params = filtersToQuery(filters);
  navigate(`?${params.toString()}`, { replace: true });
};

export const isValidSortField = (value: string): value is RideSortField => {
  return ['dateTime', 'seatsAvailable', 'from', 'to', 'createdAt'].includes(value);
};

export const isValidSortOrder = (value: string): value is SortOrder => {
  return value === 'asc' || value === 'desc';
};

export const isValidRole = (value: string): value is Role => {
  return ['guest', 'passenger', 'driver', 'admin'].includes(value);
};