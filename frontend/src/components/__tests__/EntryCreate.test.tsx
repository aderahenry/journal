import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../test/test-utils';
import EntryCreate from '../../pages/EntryCreate';

// Mock the RTK Query hooks
const createEntryMock = vi.fn().mockResolvedValue({ data: { id: 1 } });

vi.mock('../../store/api', () => {
  return {
    useCreateEntryMutation: () => [createEntryMock, { isLoading: false }]
  };
});

describe('EntryCreate Component', () => {
  beforeEach(() => {
    render(<EntryCreate />);
  });

  it('renders the create entry form', () => {
    expect(screen.getByText('New Entry')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new tag/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const submitButton = screen.getByRole('button', { name: /create entry/i });
    expect(submitButton).toBeDisabled();

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Test Content' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('allows adding tags', () => {
    const tagInput = screen.getByLabelText(/new tag/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    // Add a tag
    fireEvent.change(tagInput, { target: { value: 'test-tag' } });
    fireEvent.click(addButton);

    expect(screen.getByText('test-tag')).toBeInTheDocument();
    expect(tagInput).toHaveValue(''); // Input should be cleared
  });

  it('prevents duplicate tags', () => {
    const tagInput = screen.getByLabelText(/new tag/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    // Add a tag
    fireEvent.change(tagInput, { target: { value: 'test-tag' } });
    fireEvent.click(addButton);

    // Try to add the same tag again
    fireEvent.change(tagInput, { target: { value: 'test-tag' } });
    fireEvent.click(addButton);

    // Should only have one tag
    const tags = screen.getAllByText('test-tag');
    expect(tags).toHaveLength(1);
  });

  it('allows selecting a mood', () => {
    // Open the select
    const moodSelect = screen.getByLabelText('Mood');
    fireEvent.mouseDown(moodSelect);
    
    // Find the Happy option in the dropdown menu and click it
    const happyOption = screen.getByText('Happy');
    fireEvent.click(happyOption);
    
    // Use getAllByText to check if the selected value is shown
    const selectedValue = screen.getAllByText('Happy');
    expect(selectedValue.length).toBeGreaterThan(0);
  });

  it('submits the form with valid data', async () => {
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Entry' } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Test content' } });
    
    // Select mood
    const moodSelect = screen.getByLabelText('Mood');
    fireEvent.mouseDown(moodSelect);
    fireEvent.click(screen.getByText('Happy'));

    // Add a tag
    fireEvent.change(screen.getByLabelText(/new tag/i), { target: { value: 'test-tag' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create entry/i });
    fireEvent.click(submitButton);
    
    // Verify the mutation was called
    expect(createEntryMock).toHaveBeenCalled();
  });
}); 