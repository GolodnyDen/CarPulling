import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../src/pages/LoginPage';
import api from '../../src/services/api';

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

vi.mock('../../src/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  it('отправляет форму с валидными данными', async () => {
    vi.mocked(api.post).mockResolvedValue({
      success: true,
      user: {
        id: '1',
        name: 'Test',
        email: 't@t.com',
        role: 'passenger' as const,
      },
      token: 'abc',
    } as AuthResponse);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/login', {
        email: 'test@example.com',
        password: '123456',
      });
    });
  });

  it('показывает ошибку при неверном пароле', async () => {
    const mockError = {
      response: {
        data: {
          error: 'Неверные данные',
        },
      },
    };

    vi.mocked(api.post).mockRejectedValue(mockError);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      const errorElement = screen.getByTestId('error-message');
      
      // @ts-expect-error - toBeInTheDocument может отсутствовать в типах
      expect(errorElement).toBeInTheDocument();

      // @ts-expect-error - Проверяем, что внутри есть текст (любой)
      expect(errorElement).not.toHaveTextContent('');
      
      expect(errorElement.textContent).toMatch(/ошибка/i);
    });
  });
});