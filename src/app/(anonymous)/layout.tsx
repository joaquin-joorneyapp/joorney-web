'use client';

import * as React from 'react';

export default function AnonymousLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
