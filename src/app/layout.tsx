'use client'

import { Global, css } from '@emotion/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry'

const GlobalStyles = css`
  body {
    input[type='number']::-webkit-inner-spin-button,
    input[type='number']::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
`
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Global styles={GlobalStyles} />
        <ThemeRegistry>
          <QueryClientProvider client={new QueryClient()}>
          {children}
          </QueryClientProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
