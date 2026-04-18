// src/components/RideFilters.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import type { SerializableFilters, RideSortField, SortOrder } from '../types';
import { queryToFilters, updateUrlFilters } from '../utils/filterUtils';

interface Props {
  onApply: (filters: SerializableFilters) => void;
  initialFilters?: SerializableFilters;
}

const isValidSortField = (value: string): value is RideSortField => {
  return ['dateTime', 'seatsAvailable', 'from', 'to', 'createdAt'].includes(value);
};

const isValidSortOrder = (value: string): value is SortOrder => {
  return value === 'asc' || value === 'desc';
};

export default function RideFilters({ onApply, initialFilters = {} }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [filters, setFilters] = useState<SerializableFilters>({
    search: '',
    from: '',
    to: '',
    minSeats: 1,
    sortBy: 'dateTime',
    sortOrder: 'asc',
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlFilters = queryToFilters(params);
    setFilters(prev => ({ ...prev, ...urlFilters }));
  }, [location.search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlFilters({ ...filters, page: 1 }, navigate);
    onApply({ ...filters, page: 1 });
  };

  const handleReset = () => {
    const empty: SerializableFilters = { 
      page: 1, limit: 10, sortBy: 'dateTime', sortOrder: 'asc', minSeats: 1 
    };
    setFilters(empty);
    updateUrlFilters(empty, navigate);
    onApply(empty);
  };

  const handleSortFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (isValidSortField(value)) {
      setFilters({ ...filters, sortBy: value });
    }
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (isValidSortOrder(value)) {
      setFilters({ ...filters, sortOrder: value });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-gray-200">Фильтры</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Поиск */}
        <input
          type="text"
          placeholder="Поиск..."
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        {/* Откуда */}
        <input
          type="text"
          placeholder="Откуда"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
          value={filters.from || ''}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />

        {/* Куда */}
        <input
          type="text"
          placeholder="Куда"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
          value={filters.to || ''}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />

        {/* Мин. мест */}
        <input
          type="number"
          min="1"
          placeholder="Мест"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
          value={filters.minSeats || 1}
          onChange={(e) => setFilters({ ...filters, minSeats: parseInt(e.target.value) || 1 })}
        />

        {/* Сортировка */}
        <select
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
          value={filters.sortBy}
          onChange={handleSortFieldChange}
        >
          <option value="dateTime">По дате</option>
          <option value="seatsAvailable">По местам</option>
          <option value="from">Откуда</option>
          <option value="to">Куда</option>
          <option value="createdAt">По дате создания</option>
        </select>

        {/* Порядок */}
        <select
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
          value={filters.sortOrder}
          onChange={handleSortOrderChange}
        >
          <option value="asc">↑ По возрастанию</option>
          <option value="desc">↓ По убыванию</option>
        </select>

        {/* На страницу */}
        <select
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
          value={filters.limit}
          onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
        >
          <option value="5">5 на страницу</option>
          <option value="10">10 на страницу</option>
          <option value="20">20 на страницу</option>
        </select>
      </div>

      <div className="flex gap-3 mt-4">
        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-lg">
          Применить
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Сброс
        </button>
      </div>
    </form>
  );
}