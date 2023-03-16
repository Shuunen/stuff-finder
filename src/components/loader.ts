import { debounce, div, on } from 'shuutils'
import { delays } from '../constants'
import type { AppLoaderToggleEvent } from '../types'

const svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><defs/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0A12 12 0 000 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 8l3-2.7z" class="opacity-75"/></svg>'
const icon = div('h-24 w-24 animate-spin opacity-50', svg)

window.customElements.define('app-loader', class extends HTMLElement {
  public connectedCallback () {
    const backdrop = div('app-loader fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-white/50', icon)
    const toggle = debounce((isActive: boolean) => backdrop.classList.toggle('hidden', !isActive), delays.small)
    on<AppLoaderToggleEvent>('app-loader--toggle', async isActive => { await toggle(isActive) })
    if (!this.parentNode) throw new Error('no parentNode for app-loader')
    this.parentNode.replaceChild(backdrop, this)
  }
})
