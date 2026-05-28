import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../src/pages/Dashboard';
import * as useAuthHook from '../../src/hooks/useAuth';
import * as useVocabularyHook from '../../src/hooks/useVocabulary';
import { progressService } from '../../src/services/progressService';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../src/hooks/useVocabulary', () => ({
  useVocabulary: vi.fn()
}));

vi.mock('../../src/services/progressService', () => ({
  progressService: {
    getOverallStats: vi.fn(),
  }
}));

// Mock Recharts to avoid jsdom rendering issues with ResponsiveContainer
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthHook.useAuth.mockReturnValue({
      user: { full_name: 'Test User' },
      logout: vi.fn()
    });
    useVocabularyHook.useVocabulary.mockReturnValue({
      words: [{ id: 1 }, { id: 2 }],
      lists: [{ id: 1 }],
      fetchWords: vi.fn(),
      fetchLists: vi.fn(),
      loading: false
    });
    progressService.getOverallStats.mockResolvedValue({
      streak: 5,
      recent_activity: [],
      game_accuracy: []
    });
  });

  it('renders welcome message and stats', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome back,/i)).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();

    await waitFor(() => {
      expect(progressService.getOverallStats).toHaveBeenCalled();
      expect(screen.getByText('5 Días')).toBeInTheDocument();
    });
  });

  it('renders vocabulary summary (lists and words counts)', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      // 1 list, 2 words
      expect(screen.getByText('1')).toBeInTheDocument(); // list count
      expect(screen.getByText('2')).toBeInTheDocument(); // words count
    });
  });
});
