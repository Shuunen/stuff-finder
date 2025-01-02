import { render } from 'preact'
import { App } from './app.tsx'
import './assets/styles.css'
import './main.to.migrate.ts'

const root = document.querySelector('#app')
if (!root) throw new Error('No root element found!')
render(<App />, root)
