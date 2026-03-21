import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SignUp from './page';

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

describe('SignUp page layout', () => {
  it('renders the sign-up form', () => {
    render(<SignUp />);
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
  });

  it('renders the background image panel', () => {
    render(<SignUp />);
    expect(screen.getByTestId('background-panel')).toBeInTheDocument();
  });
});
