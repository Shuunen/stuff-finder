import { type } from '@camwiegert/typical'
import { div, h1, on } from 'shuutils'
import type { AppPrompterTypeEvent } from '../types'

window.customElements.define('app-prompter', class extends HTMLElement {
  public connectedCallback () {
    const wrapper = div('h-32')
    const prompter = h1('app-highlight mb-12 mt-8 whitespace-pre text-center text-4xl text-purple-700')
    wrapper.append(prompter)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    on<AppPrompterTypeEvent>('app-prompter--type', options => type(prompter, ...options))
    if (!this.parentNode) throw new Error('no parentNode found for app-prompter')
    this.parentNode.replaceChild(wrapper, this)
  }
})
