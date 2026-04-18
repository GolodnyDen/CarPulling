import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Ride } from '../types';
import { useUser } from '../hooks/useUser';
import type { AxiosError } from 'axios';
import { MapPin, Clock, Users, ArrowLeft } from 'lucide-react';
import Toast from '../components/Toast';
import api from '../services/api';


export default function RideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [ride, setRide] = useState<Ride | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      setFetchLoading(true);
      try {
        const res = await api.get<Ride>(`/rides/${id}`);
        setRide(res.data);
      } catch (err) {
        console.error(err);
        setRide(null);
      } finally {
        setFetchLoading(false);
      }
    };
    if (id) fetchRide();
  }, [id]);

  const handleJoin = async () => {
    if (!ride || !user) return;

    setLoading(true);
    try {
      await api.post(`/rides/${ride.id}/join`, { userId: user.id });
      setShowToast(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      alert(error.response?.data?.error || 'Не удалось записаться');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen bg-gray-950 flex items-center justify-center p-4"
      >
        <div className="text-gray-400 animate-pulse">Загрузка поездки...</div>
      </motion.div>
    );
  }

  if (!ride) {
    return (
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen bg-gray-950 flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full text-center">
          <p className="text-gray-400 mb-4">Поездка не найдена</p>
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-400 hover:text-indigo-300 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Назад
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen bg-gray-950 pb-20"
    >
      <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-200 flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Назад
        </button>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-200 mb-6">Детали поездки</h1>

        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <MapPin className="w-6 h-6 text-blue-400 mr-2 flex-shrink-0" />
            <span className="text-gray-200 text-lg font-medium">
              {ride.from} → {ride.to}
            </span>
          </div>

          <div className="space-y-3 text-gray-400">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                {new Date(ride.dateTime).toLocaleString('ru-RU', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>Свободно мест: {ride.seatsAvailable}</span>
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={ride.seatsAvailable <= 0 || !user || loading}
            className={`w-full mt-6 py-3 rounded-xl font-medium ${
              ride.seatsAvailable > 0 && user && !loading
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading
              ? 'Запись...'
              : ride.seatsAvailable > 0
              ? '✅ Записаться'
              : '🚫 Мест нет'}
          </button>
        </div>

        <Toast message="Вы записались на поездку!" isVisible={showToast} />
      </div>
    </motion.div>
  );
}