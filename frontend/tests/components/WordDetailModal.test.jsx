import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WordDetailModal from '../../src/components/WordDetailModal';

describe('WordDetailModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnPlay = vi.fn();
  const mockOnEdit = vi.fn();

  const mockWord = {
    id: 1,
    name: 'apple',
    meaning: 'A round fruit with red or green skin and a whitish interior.',
    word_types: ['noun'],
    examples: ['I ate an apple.'],
    synonyms: 'fruit',
    antonyms: '',
    image: 'http://example.com/apple.jpg'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when word is null', () => {
    const { container } = render(
      <WordDetailModal word={null} onClose={mockOnClose} onPlay={mockOnPlay} onEdit={mockOnEdit} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders word details correctly', () => {
    render(
      <WordDetailModal word={mockWord} onClose={mockOnClose} onPlay={mockOnPlay} onEdit={mockOnEdit} />
    );

    expect(screen.getByText('apple')).toBeInTheDocument();
    expect(screen.getByText('noun')).toBeInTheDocument();
    expect(screen.getByText('A round fruit with red or green skin and a whitish interior.')).toBeInTheDocument();
    expect(screen.getByText('I ate an apple.')).toBeInTheDocument();
    expect(screen.getByText('fruit')).toBeInTheDocument();
  });

  it('calls onPlay when listen button is clicked', () => {
    render(
      <WordDetailModal word={mockWord} onClose={mockOnClose} onPlay={mockOnPlay} onEdit={mockOnEdit} />
    );

    fireEvent.click(screen.getByText(/Listen/i));
    expect(mockOnPlay).toHaveBeenCalledWith('apple');
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <WordDetailModal word={mockWord} onClose={mockOnClose} onPlay={mockOnPlay} onEdit={mockOnEdit} />
    );

    const buttons = screen.getAllByRole('button');
    // Button 0: Close, Button 1: Listen, Button 2: Edit
    fireEvent.click(buttons[2]);
    expect(mockOnEdit).toHaveBeenCalledWith(1);
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <WordDetailModal word={mockWord} onClose={mockOnClose} onPlay={mockOnPlay} onEdit={mockOnEdit} />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // Close button is first
    expect(mockOnClose).toHaveBeenCalled();
  });
});
