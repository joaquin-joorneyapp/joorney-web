import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
}));
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: any) => children,
}));
vi.mock('@emotion/react', () => ({
  Global: () => null,
  css: (x: any) => x,
}));
vi.mock('@/contexts/AuthUserContext', () => ({
  AuthUserContext: {
    Provider: ({ children }: any) => <>{children}</>,
  },
}));
vi.mock('../components/ThemeRegistry/ThemeRegistry', () => ({
  default: ({ children }: any) => <>{children}</>,
}));

import Providers from './providers';

describe('Providers', () => {
  it('renders its children', () => {
    render(
      <Providers>
        <div data-testid="child">hello</div>
      </Providers>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
