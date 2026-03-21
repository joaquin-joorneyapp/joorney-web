'use client';

import { AuthUserContext } from '@/contexts/AuthUserContext';
import { Global, css } from '@emotion/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry';

const GlobalStyles = css`
  body {
    input[type='number']::-webkit-inner-spin-button,
    input[type='number']::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
`;

export default function Providers({ children }: { children: React.ReactNode }) {
  // This authUser will be shared along the whole app, using the context.
  const [user, setUser] = useState(null);

  const router = useRouter();

  // Stabilise QueryClient with useState — prevents recreation on every render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: {
            onError: (error) => {
              if ((error as AxiosError)?.response?.status === 401) {
                localStorage.clear();
                const { pathname, search = '' } = location;
                router.push(`/login#redirect=${pathname}${search}`);
              }
              return;
            },
          },
        },
      }),
  );

  // This fn persists the authenticated user information to be used when
  // the app starts and it's set to the context to be used in the whole app.
  const setAndPersistUser = (user: any) => {
    user.isAuthenticated = true;
    user.isAdmin = user.abilities.includes('admin');
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', user.token);
    setUser(user);
  };

  // When the app starts, it checks if there's a persisted token
  // It'd mean there's an active session.
  useEffect(() => {
    const persistedUser = localStorage.getItem('user');
    if (persistedUser) {
      setUser(JSON.parse(persistedUser));
    }
  }, []);

  return (
    <ThemeRegistry>
      <GoogleOAuthProvider clientId="171259896077-j3s5o87e1ii63l0a355n4l6v0ilg0tnh.apps.googleusercontent.com">
        <QueryClientProvider client={queryClient}>
          <AuthUserContext.Provider value={{ user, setUser: setAndPersistUser }}>
            <Global styles={GlobalStyles} />
            {children}
          </AuthUserContext.Provider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ThemeRegistry>
  );
}
