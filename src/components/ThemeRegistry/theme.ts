import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';
import localFont from "next/font/local";

const productSansFont = localFont({
  src: [
    {
      path: '../../../public/fonts/Product Sans Regular.ttf',
      weight: '400',
    },
    {
      path: '../../../public/fonts/Product Sans Bold.ttf',
      weight: '700',
    },
    {
      path: '../../../public/fonts/Product Sans Italic.ttf',
      style: 'italic',
      weight: '400',
    },
    {
      path: '../../../public/fonts/Product Sans Bold Italic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-poppins',
  display: 'swap',
});

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#F67D56',
    },
    secondary: {
      main: '#222231cf',
    },
  },
  typography: {
    fontFamily: productSansFont.style.fontFamily,
    h4: {
      color: '#222231cf',
    },
    body1: {
      fontFamily: roboto.style.fontFamily,
      fontWeight: 300,
    },
    body2: {
      fontFamily: roboto.style.fontFamily,
      fontWeight: 300,
    },
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === 'info' && {
            backgroundColor: '#60a5fa',
          }),
        }),
      },
    },
  },
});

export default theme;
