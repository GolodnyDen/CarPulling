import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Ride } from '../types';
import { useUser } from '../hooks/useUser';
import type { AxiosError } from 'axios';
import { MapPin, Clock, Users, ArrowLeft } from 'lucide-react';
import Toast from '../components/Toast';

export default function RideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useUser();
  const [ride, setRide] = useState<Ride | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await api.get<Ride[]>('/rides');
        const found = res.data.find(r => r.id === id);
        setRide(found || null);
      } catch (err) {
        console.error(err);
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

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
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
    </div>
  );
}