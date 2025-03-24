import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../../test/test-utils';
import Stats from '../../pages/Stats';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

const mockStats = {
  totalEntries: 10,
  totalWords: 500,
  avgWordsPerEntry: 50,
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
};

// Create a mock that can be modified between tests
let mockApiState = {
  data: mockStats,
  isLoading: false,
  error: null,
};

// Mock the api module
vi.mock('../../store/api', () => {
  return {
    useGetEntryStatsQuery: () => mockApiState
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Stats Component', () => {
  beforeEach(() => {
    // Reset mock to default state before each test
    mockApiState = {
      data: mockStats,
      isLoading: false,
      error: null,
    };
    renderWithProviders(<Stats />);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays summary statistics', async () => {
    await waitFor(() => {
      expect(screen.getByText('Total Entries')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Total entries
      expect(screen.getByText('500')).toBeInTheDocument(); // Total words
      expect(screen.getByText('50.0')).toBeInTheDocument(); // Avg words per entry
      expect(screen.getByText('5')).toBeInTheDocument(); // Tag count
    });
  });

  it('renders mood distribution chart', async () => {
    await waitFor(() => {
      expect(screen.getByText('Mood Distribution')).toBeInTheDocument();
      expect(screen.getByText('Happy')).toBeInTheDocument();
      expect(screen.getByText('Sad')).toBeInTheDocument();
      expect(screen.getByText('Neutral')).toBeInTheDocument();
    });
  });

  it('renders category distribution chart', async () => {
    await waitFor(() => {
      expect(screen.getByText('Category Distribution')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Ideas')).toBeInTheDocument();
    });
  });

  it('displays loading state while fetching data', () => {
    // Set mock to loading state
    mockApiState = {
      data: null,
      isLoading: true,
      error: null,
    };
    // Render again with new mock state
    renderWithProviders(<Stats />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Set mock to error state
    mockApiState = {
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch stats'),
    };
    // Render again with new mock state
    renderWithProviders(<Stats />);
    await waitFor(() => {
      expect(screen.getByText(/problem loading your journal statistics/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no data is available', async () => {
    // Set mock to empty data state
    mockApiState = {
      data: null,
      isLoading: false,
      error: null,
    };
    // Render again with new mock state
    renderWithProviders(<Stats />);
    await waitFor(() => {
      expect(screen.getByText(/start creating journal entries/i)).toBeInTheDocument();
    });
  });
}); 