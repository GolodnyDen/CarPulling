// frontend/__tests__/integration/forms.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../src/pages/LoginPage';
import api from '../../src/services/api';

// Тип для ответа авторизации
interface AuthResponse {
  success: true;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'passenger' | 'driver';
  };
  token: string;
}

// Тип для ошибки API
interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

// Мокаем весь модуль api
vi.mock('../../src/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: { 
      request: { use: vi.fn() }, 
      response: { use: vi.fn() } 
    }
  }
}));

describe('LoginPage', () => {
  // ОДИН beforeEach для всех тестов в этом describe
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  it('отправляет форму с валидными данными', async () => {
    // Настраиваем успешный ответ
    vi.mocked(api.post).mockResolvedValue({
      success: true,
      user: { 
        id: '1', 
        name: 'Test', 
        email: 't@t.com', 
        role: 'passenger' as const
      },
      token: 'abc'
    } as AuthResponse);

    // Рендерим компонент
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Заполняем форму
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: '123456' }
    });
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));

    // Проверяем вызов API
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/login', {
        email: 'test@example.com',
        password: '123456'
      });
    });
  });

  it('показывает ошибку при неверном пароле', async () => {
    // Настраиваем ошибку
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { error: 'Неверные данные' } }
    } as ApiError);

    // Рендерим компонент
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Заполняем форму с неверным паролем
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'wrong' }
    });
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));

    // Проверяем отображение ошибки
    await waitFor(() => {
      expect(screen.getByText(/Неверные данные/)).toBeInTheDocument();
    });
  });
});