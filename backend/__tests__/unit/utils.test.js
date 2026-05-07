const { filterAndPaginate } = require('../../server');

describe('filterAndPaginate', () => {
  const rides = [
    { id: '1', from: 'Москва', to: 'СПб', seatsAvailable: 3, dateTime: '2024-12-20' },
    { id: '2', from: 'Москва', to: 'Казань', seatsAvailable: 1, dateTime: '2024-12-21' },
  ];

  test('фильтрация по from', () => {
    const result = filterAndPaginate(rides, { from: 'Москва' }, ['from', 'to']);
    expect(result.data).toHaveLength(2);
    expect(result.data.every(r => r.from === 'Москва')).toBe(true);
  });

  test('фильтрация по minSeats', () => {
    const result = filterAndPaginate(rides, { minSeats: 2 }, []);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('1');
  });

  test('пагинация', () => {
    const result = filterAndPaginate(rides, { page: 1, limit: 1 }, []);
    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.totalPages).toBe(2);
  });
});