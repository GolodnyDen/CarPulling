import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../src/pages/LoginPage';
import api from '../../src/services/api';

// Мокаем api
vi.mock('../../src/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } }
  }
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as any).mockReturnValue(null);
  });

  it('отправляет форму с валидными данными', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { 
        success: true, 
        user: { id: '1', name: 'Test', email: 't@t.com', role: 'passenger' },
        token: 'abc'
      }
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: '123456' }
    });
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/login', {
        email: 'test@example.com',
        password: '123456'
      });
    });
  });

  it('показывает ошибку при неверном пароле', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { error: 'Неверные данные' } }
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'wrong' }
    });
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(screen.getByText(/Неверные данные/)).toBeInTheDocument();
    });
  });
});