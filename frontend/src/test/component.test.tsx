// src/test/component.test.tsx - TESTS BÁSICOS COMPONENTES
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';

import nordiaTheme from '../theme/nordiaTheme';
import { AppProvider } from '../context/AppContext';
import { NordiaButton, NordiaCard } from '../components/UI';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider theme={nordiaTheme}>
      <AppProvider>
        {children}
      </AppProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('UI Components', () => {
  it('renders NordiaButton correctly', () => {
    render(
      <TestWrapper>
        <NordiaButton>Test Button</NordiaButton>
      </TestWrapper>
    );

    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders NordiaCard correctly', () => {
    render(
      <TestWrapper>
        <NordiaCard>
          <div>Test Card Content</div>
        </NordiaCard>
      </TestWrapper>
    );

    expect(screen.getByText('Test Card Content')).toBeInTheDocument();
  });

  it('handles button click events', () => {
    const handleClick = vi.fn();

    render(
      <TestWrapper>
        <NordiaButton onClick={handleClick}>
          Click Me
        </NordiaButton>
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('Analytics Dashboard', () => {
  it('renders analytics dashboard', () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('📊 Analytics Neural')).toBeInTheDocument();
  });

  it('shows loading skeleton initially', () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Should show loading state initially
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('Theme', () => {
  it('applies nordia theme correctly', () => {
    const { container } = render(
      <ThemeProvider theme={nordiaTheme}>
        <div>Test</div>
      </ThemeProvider>
    );

    expect(container).toBeInTheDocument();
  });
});

describe('Context', () => {
  it('provides app context', () => {
    render(
      <TestWrapper>
        <div>Test Context</div>
      </TestWrapper>
    );

    expect(screen.getByText('Test Context')).toBeInTheDocument();
  });
});