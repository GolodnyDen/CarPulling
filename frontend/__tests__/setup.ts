import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

interface StorageMock {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  key: (index: number) => string | null;
  length: number;
}

const localStorageMock: StorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(() => null),
  length: 0,
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

globalThis.fetch = vi.fn() as unknown as typeof globalThis.fetch;

beforeEach(() => {
  vi.clearAllMocks();
  (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
});