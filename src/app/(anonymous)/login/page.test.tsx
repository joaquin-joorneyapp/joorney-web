import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WrappedLogin from './page';

// Mock GoogleLogin — it loads an external iframe which doesn't work in jsdom
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <button>Sign in with Google</button>,
}));

// Mock AuthUserContext so the component has a valid context
vi.mock('@/contexts/AuthUserContext', () => ({
  AuthUserContext: {
    _currentValue: { user: null, setUser: vi.fn() },
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: (v: any) => React.ReactNode }) =>
      children({ user: null, setUser: vi.fn() }),
  },
}));

describe('Login page layout', () => {
  it('renders the sign-in form', () => {
    render(<WrappedLogin />);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders the background image panel', () => {
    render(<WrappedLogin />);
    expect(screen.getByTestId('background-panel')).toBeInTheDocument();
  });

  it('form panel uses correct MUI Grid v2 column sizing (sm:8, md:5)', () => {
    const { container } = render(<WrappedLogin />);
    // MuiGrid-grid-sm-8 / MuiGrid-grid-md-5 are only present when
    // size={{ sm: 8, md: 5 }} is set via the Grid v2 API.
    // If the old Grid v1 props (item xs sm md) are used instead,
    // these classes will be absent and the layout will break.
    const leftPanel = container.querySelector('.MuiGrid-grid-sm-8.MuiGrid-grid-md-5');
    expect(leftPanel).not.toBeNull();
  });

  it('background panel uses correct MUI Grid v2 column sizing (sm:4, md:7)', () => {
    const { container } = render(<WrappedLogin />);
    const bgPanel = container.querySelector('.MuiGrid-grid-sm-4.MuiGrid-grid-md-7');
    expect(bgPanel).not.toBeNull();
    expect(bgPanel).toBe(screen.getByTestId('background-panel'));
  });
});
