import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { SerializableFilters, RideQueryParams } from '../types';
import { queryToFilters, filtersToQuery } from '../utils/filterUtils';

export const useRideFilters = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [filters, setFilters] = useState<SerializableFilters>({
    page: 1,
    limit: 10,
    sortBy: 'dateTime',
    sortOrder: 'asc',
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlFilters = queryToFilters(params);
    setFilters(urlFilters);
  }, [location.search]);

  const updateFilters = useCallback((
    newFilters: Partial<SerializableFilters>,
    resetPage = false
  ) => {
    const updated = { ...filters, ...newFilters };
    if (resetPage) updated.page = 1;
    
    setFilters(updated);
    
    const params = filtersToQuery(updated);
    navigate(`?${params.toString()}`, { replace: true });
  }, [filters, navigate]);

  const resetFilters = useCallback(() => {
    const empty: SerializableFilters = { 
      page: 1, limit: 10, sortBy: 'dateTime', sortOrder: 'asc' 
    };
    setFilters(empty);
    const params = filtersToQuery(empty);
    navigate(`?${params.toString()}`, { replace: true });
  }, [navigate]);

  const toQueryParams = useCallback((): RideQueryParams => {
    return filters as RideQueryParams;
  }, [filters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    toQueryParams,
  };
};