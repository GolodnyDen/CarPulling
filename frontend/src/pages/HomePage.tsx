import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Ride } from '../types';
import { useUser } from '../hooks/useUser';
import { MapPin, Clock, Users, Plus, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchRides = async () => {
      try {
        const res = await api.get<Ride[]>('/rides');
        setRides(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRides();
  }, [user]);

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
      <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-200">🚗 Поездки</h1>
          {user.role === 'driver' && (
            <Link
              to="/create"
              className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow"
            >
              <Plus className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {rides.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Нет доступных поездок</p>
            {user.role === 'driver' && (
              <p className="mt-2">Создайте первую поездку!</p>
            )}
          </div>
        ) : (
          rides.map((ride, index) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate(`/ride/${ride.id}`)}
            >
              <div className="flex items-start mb-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-gray-200 font-semibold text-lg">
                    {ride.from} → {ride.to}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(ride.dateTime).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400 mt-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    <span>{ride.seatsAvailable} мест</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}