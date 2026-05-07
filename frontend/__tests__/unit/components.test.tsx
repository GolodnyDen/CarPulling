import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Pagination from '../../src/components/Pagination';

describe('Pagination', () => {
  it('не рендерится при 1 странице', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('показывает текущую страницу', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
    );
    expect(screen.getByText(/Стр\. 3 из 5/)).toBeInTheDocument();
  });

  it('кнопка "назад" отключена на первой странице', () => {
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
    );
    const prevBtn = screen.getAllByRole('button')[0];
    expect(prevBtn).toBeDisabled();
  });
});