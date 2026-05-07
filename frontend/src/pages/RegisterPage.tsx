import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, User as UserIcon, ArrowLeft } from 'lucide-react';
import { useUser } from '../hooks/useUser';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, actionLoading } = useUser();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'driver' | 'passenger'>('passenger');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    const result = await register(name, email, password, role);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Ошибка регистрации');
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
          aria-label="Назад"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Назад
        </button>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-200 mb-6">Регистрация</h1>
        
        {error && (
          <div data-testid="error-message" className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NAME FIELD */}
          <div>
            <label htmlFor="name" className="block text-gray-400 mb-2">
              Имя
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ваше имя"
              required
            />
          </div>

          {/* EMAIL FIELD */}
          <div>
            <label htmlFor="email" className="block text-gray-400 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="example@university.edu"
              required
            />
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label htmlFor="password" className="block text-gray-400 mb-2">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {/* ROLE SELECTION */}
          <div className="flex space-x-4" role="group" aria-labelledby="role-label">
            <span id="role-label" className="sr-only">Выберите роль</span>
            
            <button
              type="button"
              role="radio"
              aria-checked={role === 'passenger'}
              onClick={() => setRole('passenger')}
              className={`flex-1 p-3 rounded-xl flex flex-col items-center transition-all ${
                role === 'passenger'
                  ? 'bg-indigo-500 text-white shadow-lg ring-2 ring-indigo-300'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <UserIcon className="w-8 h-8 mb-1" />
              <span className="text-sm font-medium">Пассажир</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={role === 'driver'}
              onClick={() => setRole('driver')}
              className={`flex-1 p-3 rounded-xl flex flex-col items-center transition-all ${
                role === 'driver'
                  ? 'bg-indigo-500 text-white shadow-lg ring-2 ring-indigo-300'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Car className="w-8 h-8 mb-1" />
              <span className="text-sm font-medium">Водитель</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={actionLoading === 'register'}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {actionLoading === 'register' ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}