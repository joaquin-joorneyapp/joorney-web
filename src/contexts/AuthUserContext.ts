import { createContext } from 'react';

export const AuthUserContext = createContext<any>({
  user: null,
  setUser: (_: any) => {},
});
