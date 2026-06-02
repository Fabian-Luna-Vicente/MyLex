import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateListModal from '../../src/components/CreateListModal';

describe('CreateListModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CreateListModal isOpen={false} onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <CreateListModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    expect(screen.getAllByText(/Create New/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/List/i).length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('e.g. Travel Vocabulary, Irregular Verbs...')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <CreateListModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('submits the form and calls onCreate', async () => {
    mockOnCreate.mockResolvedValueOnce(); // simulate success

    render(
      <CreateListModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    const input = screen.getByPlaceholderText('e.g. Travel Vocabulary, Irregular Verbs...');
    fireEvent.change(input, { target: { value: 'My Test List' } });

    fireEvent.click(screen.getByRole('button', { name: /Create List/i }));

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({
        name: 'My Test List',
        privacy: 'public',
        language: 'English'
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('prevents submission when list name is empty', () => {
    render(
      <CreateListModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    const submitBtn = screen.getByRole('button', { name: /Create List/i });
    expect(submitBtn).toBeDisabled();
    
    fireEvent.click(submitBtn);
    expect(mockOnCreate).not.toHaveBeenCalled();
  });
});
