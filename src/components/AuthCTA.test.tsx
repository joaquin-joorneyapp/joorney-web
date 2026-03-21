import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/AuthUserContext', () => ({
  AuthUserContext: {
    _currentValue: { user: null, setUser: vi.fn() },
    Provider: ({ children }: any) => <>{children}</>,
    Consumer: ({ children }: any) => children({ user: null, setUser: vi.fn() }),
  },
}));

import AuthCTA from './AuthCTA';

describe('AuthCTA', () => {
  it('renders the sign-in banner when no user is in context', () => {
    render(<AuthCTA />);
    expect(screen.getByText(/sign in to save activities/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });
});
