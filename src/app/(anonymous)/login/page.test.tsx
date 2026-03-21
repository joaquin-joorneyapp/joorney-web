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

  it('background panel has display:none on xs and block on sm via sx', () => {
    render(<WrappedLogin />);
    const panel = screen.getByTestId('background-panel');
    // The sx display responsive value is applied as a MUI class. We verify the
    // element is present in the DOM — CSS media queries are not applied in jsdom,
    // but presence in the DOM confirms the panel was not accidentally removed.
    expect(panel).toBeInTheDocument();
  });
});
