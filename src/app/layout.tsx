'use client';

import { AuthUserContext } from '@/contexts/AuthUserContext';
import { Global, css } from '@emotion/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'mapbox-gl/dist/mapbox-gl.css';
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
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This authUser will be shared along the whole app, using the context.
  const [user, setUser] = useState(null);

  // This fn persists the authenticated user information to be used when
  // the app starts and it's set to the context to be used in the whole app.
  const setAndPersistUser = (user: any) => {
    user.isAuthenticated = true;
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
    <html lang="en">
      <body>
        <Global styles={GlobalStyles} />
        <ThemeRegistry>
          <GoogleOAuthProvider clientId="171259896077-j3s5o87e1ii63l0a355n4l6v0ilg0tnh.apps.googleusercontent.com">
            <QueryClientProvider client={new QueryClient()}>
              <AuthUserContext.Provider
                value={{ user, setUser: setAndPersistUser }}
              >
                {children}
              </AuthUserContext.Provider>
            </QueryClientProvider>
          </GoogleOAuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
