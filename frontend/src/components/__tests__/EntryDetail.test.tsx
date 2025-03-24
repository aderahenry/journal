import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../../test/test-utils';
import EntryDetail from '../../pages/EntryDetail';
import { vi } from 'vitest';

// Mock window.confirm
window.confirm = vi.fn();

// Mock the react-router-dom module at the module level
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  };
});

const mockEntry = {
  id: 1,
  title: 'Test Entry',
  content: 'Test content',
  mood: 'Happy',
  createdAt: '2024-03-24T00:00:00Z',
  updatedAt: '2024-03-24T00:00:00Z',
  tags: [{ id: 1, name: 'test-tag' }],
};

// Mock the RTK Query hook
const deleteEntryMock = vi.fn().mockResolvedValue({});

vi.mock('../../store/api', () => {
  return {
    useGetEntryQuery: () => ({
      data: mockEntry,
      isLoading: false,
      error: null
    }),
    useDeleteEntryMutation: () => [
      deleteEntryMock,
      { isLoading: false }
    ]
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

describe('EntryDetail Component', () => {
  beforeEach(() => {
    renderWithProviders(<EntryDetail />);
    vi.clearAllMocks();
  });

  it('renders the entry details', async () => {
    await waitFor(() => {
      // Check title and content
      expect(screen.getByText(mockEntry.title)).toBeInTheDocument();
      expect(screen.getByText(mockEntry.content)).toBeInTheDocument();
      
      // Check mood - it's in a Chip component
      expect(screen.getByText(mockEntry.mood)).toBeInTheDocument();
      
      // Check tag - it's in a Chip component
      expect(screen.getAllByText(mockEntry.tags[0].name)).toHaveLength(1);
    });
  });

  it('displays formatted date', async () => {
    await waitFor(() => {
      // Format the date as expected by the component
      const date = new Date(mockEntry.createdAt);
      const formattedDate = date.toLocaleDateString();
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });
  });

  it('shows edit button for the entry', async () => {
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });
  });

  it('shows delete button for the entry', async () => {
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  it('handles delete confirmation', async () => {
    // Mock window.confirm to return true
    (window.confirm as any).mockReturnValueOnce(true);
    
    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);
    });
    
    // Check if confirmation was displayed
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this entry?');
    
    // Verify the mutation was called
    expect(deleteEntryMock).toHaveBeenCalled();
  });

  it('displays mood chip', async () => {
    await waitFor(() => {
      const moodChip = screen.getByText(mockEntry.mood);
      expect(moodChip).toBeInTheDocument();
      // Verify that the mood is in a chip component
      expect(moodChip.closest('.MuiChip-root')).not.toBeNull();
    });
  });

  it('displays tags as chips', async () => {
    await waitFor(() => {
      const tagChip = screen.getByText(mockEntry.tags[0].name);
      expect(tagChip).toBeInTheDocument();
      // Verify that the tag is in a chip component
      expect(tagChip.closest('.MuiChip-root')).not.toBeNull();
    });
  });
}); 