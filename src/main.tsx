import ThemeProvider from '@mui/material/styles/ThemeProvider'
import { render } from 'preact'
import { App } from './app.tsx'
import './assets/styles.css'
import './main.to-migrate.ts'
import { theme } from './utils/theme.utils.ts'

const root = document.querySelector('#app')
if (!root) throw new Error('No root element found!')
render(<ThemeProvider theme={theme}><App /></ThemeProvider>, root)
