// src/pages/HomePage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Ride, SerializableFilters } from '../types';
import { useUser } from '../hooks/useUser';
import RideFilters from '../components/RideFilters';
import Pagination from '../components/Pagination';
import { rideService } from '../services/rideService';

export default function HomePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [rides, setRides] = useState<Ride[]>([]);
  const [filters, setFilters] = useState<SerializableFilters>({
    page: 1,
    limit: 10,
    sortBy: 'dateTime',
    sortOrder: 'asc',
  });
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const parseFiltersFromUrl = useCallback((): SerializableFilters => {
    const params = new URLSearchParams(location.search);
    return {
      search: params.get('search') || undefined,
      from: params.get('from') || undefined,
      to: params.get('to') || undefined,
      minSeats: params.get('minSeats') ? parseInt(params.get('minSeats')!) : undefined,
      sortBy: params.get('sortBy') as SerializableFilters['sortBy'] || 'dateTime',
      sortOrder: params.get('sortOrder') as SerializableFilters['sortOrder'] || 'asc',
      page: params.get('page') ? parseInt(params.get('page')!) : 1,
      limit: params.get('limit') ? parseInt(params.get('limit')!) : 10,
    };
  }, [location.search]);


  const fetchRides = useCallback(async (newFilters: SerializableFilters) => {
    setLoading(true);
    try {
      const res = await rideService.getRides(newFilters);
      if (res.success) {
        setRides(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch rides:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const urlFilters = parseFiltersFromUrl();
      setFilters(urlFilters);
      fetchRides(urlFilters);
    }
  }, [user, parseFiltersFromUrl, fetchRides]);

  const handleFilterApply = (newFilters: SerializableFilters) => {
    setFilters(newFilters);
    fetchRides(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchRides(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    navigate(`?${params.toString()}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-200 mb-4">Добро пожаловать!</h1>
          <p className="text-gray-400 mb-6">Войдите или зарегистрируйтесь</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl border border-gray-700"
            >
              Войти
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium py-3 px-6 rounded-xl shadow-lg"
            >
              Регистрация
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-200">🚗 Поездки</h1>
          {user.role === 'driver' && (
            <button
              onClick={() => navigate('/create')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow"
            >
              +
            </button>
          )}
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Фильтры - используем filters и setFilters */}
        <RideFilters 
          onApply={handleFilterApply} 
          initialFilters={filters} 
        />

        {/* Список поездок */}
        {rides.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Нет поездок по заданным фильтрам</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride, index) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => navigate(`/ride/${ride.id}`)}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              >
                <h3 className="text-gray-200 font-semibold">
                  {ride.from} → {ride.to}
                </h3>
                <p className="text-gray-400 text-sm">
                  {new Date(ride.dateTime).toLocaleString('ru-RU')}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Мест: {ride.seatsAvailable}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Пагинация */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}