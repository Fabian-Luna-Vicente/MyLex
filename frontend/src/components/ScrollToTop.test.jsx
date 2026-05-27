import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';

describe('ScrollToTop Component', () => {
    beforeEach(() => {
        // Mock window.scrollTo
        window.scrollTo = vi.fn();
        
        // Mock window.speechSynthesis
        window.speechSynthesis = {
            cancel: vi.fn()
        };
    });

    it('should call window.scrollTo and speechSynthesis.cancel on render', () => {
        render(
            <MemoryRouter initialEntries={['/home']}>
                <ScrollToTop />
            </MemoryRouter>
        );

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    });
});
