import { type } from '@camwiegert/typical'
import { h1, on } from 'shuutils'

window.customElements.define('app-prompter', class extends HTMLElement {
  connectedCallback () {
    const prompter = h1('highlight text-3xl md:text-4xl whitespace-pre text-center text-purple-700 md:mt-32 mb-12')
    on('app-prompter--type', options => type(prompter, ...options))
    this.parentNode.replaceChild(prompter, this)
  }
})
