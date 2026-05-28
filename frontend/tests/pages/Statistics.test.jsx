import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Statistics from '../../src/pages/Statistics';
import { progressService } from '../../src/services/progressService';
import * as useVocabularyHook from '../../src/hooks/useVocabulary';

// Mock recharts
vi.mock('recharts', () => {
  const MockComponent = ({ children }) => <div data-testid="recharts-mock">{children}</div>;
  return {
    ResponsiveContainer: MockComponent,
    LineChart: MockComponent,
    Line: MockComponent,
    AreaChart: MockComponent,
    Area: MockComponent,
    XAxis: MockComponent,
    YAxis: MockComponent,
    CartesianGrid: MockComponent,
    Tooltip: MockComponent,
    PieChart: MockComponent,
    Pie: MockComponent,
    Cell: MockComponent,
    BarChart: MockComponent,
    Bar: MockComponent,
    Legend: MockComponent
  };
});

vi.mock('../../src/services/progressService', () => ({
  progressService: {
    getOverallStats: vi.fn(),
    getDetailedStats: vi.fn(),
  }
}));

vi.mock('../../src/hooks/useVocabulary', () => ({
  useVocabulary: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Statistics Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useVocabularyHook.useVocabulary.mockReturnValue({
      lists: [{ id: 1, name: 'List 1' }],
      fetchLists: vi.fn()
    });
  });

  it('renders overall stats and charts', async () => {
    progressService.getOverallStats.mockResolvedValue({
      streak: 5,
      longest_streak: 10,
      recent_activity: [{ date: '2026-05-28T00:00:00Z', count: 5 }],
      random_distribution: { easy: 10, normal: 5 }
    });
    progressService.getDetailedStats.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Statistics />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('5 Días')).toBeInTheDocument(); // streak
      expect(screen.getByText('10 Días')).toBeInTheDocument(); // longest streak
    });

    // Check charts mocked container
    const chartMocks = screen.getAllByTestId('recharts-mock');
    expect(chartMocks.length).toBeGreaterThan(0);
  });

  it('renders detailed data table', async () => {
    progressService.getOverallStats.mockResolvedValue({});
    progressService.getDetailedStats.mockResolvedValue([
      { id: 1, word_id: 1, game: 'hangman', is_correct: true, difficulty: null, reviewed_at: '2026-05-28T00:00:00Z', word: { name: 'Apple', meaning: 'A fruit' } }
    ]);

    render(
      <MemoryRouter>
        <Statistics />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('hangman')).toBeInTheDocument();
      expect(screen.getByText('Correct')).toBeInTheDocument();
    });
  });

  it('filters data', async () => {
    progressService.getOverallStats.mockResolvedValue({});
    progressService.getDetailedStats.mockResolvedValue([]);

    const { container } = render(
      <MemoryRouter>
        <Statistics />
      </MemoryRouter>
    );

    const gameSelect = container.querySelector('select[name="game"]');
    fireEvent.change(gameSelect, { target: { value: 'hangman' } });

    const applyBtn = screen.getByRole('button', { name: /Apply Filters/i });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(progressService.getDetailedStats).toHaveBeenCalledWith(expect.objectContaining({ game: 'hangman' }));
    });
  });
});
