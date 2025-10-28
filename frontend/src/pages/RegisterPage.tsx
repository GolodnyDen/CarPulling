import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { User } from '../types';
import type { AxiosError } from 'axios';
import { Car, User as UserIcon, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'driver' | 'passenger'>('passenger');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post<User>('/register', { name, email, role });
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/');
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      alert(error.response?.data?.error || 'Ошибка регистрации');
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-200 mb-6">Регистрация</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-400 mb-2">Имя</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setRole('passenger')}
              className={`flex-1 p-3 rounded-xl flex flex-col items-center ${
                role === 'passenger'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <UserIcon className="w-8 h-8 mb-1" />
              Пассажир
            </button>
            <button
              type="button"
              onClick={() => setRole('driver')}
              className={`flex-1 p-3 rounded-xl flex flex-col items-center ${
                role === 'driver'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Car className="w-8 h-8 mb-1" />
              Водитель
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
}