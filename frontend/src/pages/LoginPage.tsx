import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { User } from '../types';
import type { AxiosError } from 'axios';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Отправляем только email и пароль
      const response = await api.post<User>('/api/login', { email, password });
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/');
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      alert(error.response?.data?.error || 'Ошибка входа');
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-200 mb-2">Вход</h1>
        <p className="text-gray-400 mb-6">Уже есть аккаунт? Войдите здесь</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="example@university.edu"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

        
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400">
          <p>Нет аккаунта?</p>
          <button
            onClick={() => navigate('/register')}
            className="text-indigo-400 hover:text-indigo-300 font-medium mt-1"
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
}