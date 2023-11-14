import { createTheme, type ThemeOptions } from '@mui/material/styles'

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#8b32db',
    },
  },
}

export const theme = createTheme(themeOptions)
