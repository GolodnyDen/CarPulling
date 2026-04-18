import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="404 — Страница не найдена"
        description="Запрошенная страница не существует"
        noIndex={true}
      />
      
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
          <p className="text-gray-400 mb-6">Страница не найдена</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            На главную
          </button>
        </div>
      </div>
    </>
  );
}