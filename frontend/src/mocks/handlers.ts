import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth handlers
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-token',
      user: {
        id: 1,
        username: 'testuser',
      },
    });
  }),

  // Entry handlers
  http.get('/api/entries', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Test Entry',
        content: 'Test content',
        mood: 'Happy',
        createdAt: '2024-03-24T00:00:00Z',
        updatedAt: '2024-03-24T00:00:00Z',
        tags: ['test-tag'],
      },
    ]);
  }),

  http.get('/api/entries/:id', () => {
    return HttpResponse.json({
      id: 1,
      title: 'Test Entry',
      content: 'Test content',
      mood: 'Happy',
      createdAt: '2024-03-24T00:00:00Z',
      updatedAt: '2024-03-24T00:00:00Z',
      tags: ['test-tag'],
    });
  }),

  http.post('/api/entries', () => {
    return HttpResponse.json({
      id: 1,
      title: 'Test Entry',
      content: 'Test content',
      mood: 'Happy',
      createdAt: '2024-03-24T00:00:00Z',
      updatedAt: '2024-03-24T00:00:00Z',
      tags: ['test-tag'],
    });
  }),

  http.put('/api/entries/:id', () => {
    return HttpResponse.json({
      id: 1,
      title: 'Updated Entry',
      content: 'Updated content',
      mood: 'Happy',
      createdAt: '2024-03-24T00:00:00Z',
      updatedAt: '2024-03-24T00:00:00Z',
      tags: ['test-tag'],
    });
  }),

  http.delete('/api/entries/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Stats handlers
  http.get('/api/entries/stats', () => {
    return HttpResponse.json({
      totalEntries: 10,
      totalWords: 500,
      avgWordsPerEntry: 50,
      categoryCount: 3,
      tagCount: 5,
      moodDistribution: [
        { mood: 'Happy', count: 5 },
        { mood: 'Sad', count: 3 },
        { mood: 'Neutral', count: 2 },
      ],
      categoryDistribution: [
        { category: 'Personal', count: 4 },
        { category: 'Work', count: 3 },
        { category: 'Ideas', count: 3 },
      ],
    });
  }),
]; 