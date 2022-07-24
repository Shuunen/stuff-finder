import { type } from '@camwiegert/typical'
import { div, h1, on } from 'shuutils'

window.customElements.define('app-prompter', class extends HTMLElement {
  connectedCallback (): void {
    const wrapper = div('h-32')
    const prompter = h1('highlight text-4xl whitespace-pre text-center text-purple-700 mb-12 mt-8')
    wrapper.append(prompter)
    on<AppPrompterTypeEvent>('app-prompter--type', options => type(prompter, ...options))
    this.parentNode.replaceChild(wrapper, this)
  }
})
