import { type } from '@camwiegert/typical'
import { div, h1, on } from 'shuutils'

window.customElements.define('app-prompter', class extends HTMLElement {
  connectedCallback (): void {
    const wrapper = div('h-32')
    const prompter = h1('app-highlight mb-12 mt-8 whitespace-pre text-center text-4xl text-purple-700')
    wrapper.append(prompter)
    on<AppPrompterTypeEvent>('app-prompter--type', options => type(prompter, ...options))
    if (!this.parentNode) throw new Error('no parentNode found for app-prompter')
    this.parentNode.replaceChild(wrapper, this)
  }
})
