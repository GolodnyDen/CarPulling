import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../hooks/useUser';
import type { AxiosError } from 'axios';
import api from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function CreateRidePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [seats, setSeats] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!from.trim() || !to.trim() || !dateTime) {
      alert('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      await api.post('/rides', {
        driverId: user.id,
        from,
        to,
        dateTime,
        seatsAvailable: seats,
      });
      navigate('/');
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      alert(error.response?.data?.error || 'Ошибка создания поездки');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-200 mb-6">Создать поездку</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-400 mb-2">📍 Откуда</label>
            <input
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Например: Главный корпус"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">📍 Куда</label>
            <input
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Например: Общежитие №3"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">🕒 Дата и время</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={e => setDateTime(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">👥 Свободных мест</label>
            <input
              type="number"
              min="1"
              max="6"
              value={seats}
              onChange={e => setSeats(Number(e.target.value))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {loading ? 'Создание...' : 'Создать поездку'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}