import { describe, it, expect } from 'vitest';
import { filtersToQuery, queryToFilters } from '../../src/utils/filterUtils';

describe('filterUtils', () => {
  it('преобразует фильтры в query string', () => {
    const filters = { from: 'Москва', minSeats: 2, page: 1 };
    const params = filtersToQuery(filters);
    
    expect(params.get('from')).toBe('Москва');
    expect(params.get('minSeats')).toBe('2');
    expect(params.get('page')).toBe('1');
  });

  it('парсит query string обратно', () => {
    const params = new URLSearchParams('from=СПб&sortOrder=desc');
    const filters = queryToFilters(params);
    
    expect(filters.from).toBe('СПб');
    expect(filters.sortOrder).toBe('desc');
  });

  it('игнорирует пустые значения', () => {
    const filters = { from: '', search: undefined, minSeats: 3 };
    const params = filtersToQuery(filters);
    
    expect(params.has('from')).toBe(false);
    expect(params.has('search')).toBe(false);
    expect(params.get('minSeats')).toBe('3');
  });
});