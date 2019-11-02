import { type } from '@camwiegert/typical'
import { BaseModel } from '../model'

class PluginPrompt extends BaseModel {
  constructor () {
    super('prompt')
    this.log('constructor')
  }

  setupElements () {
    this.targetEl = document.querySelector('h1')
    if (!this.targetEl) {
      console.error('failed to find target')
    }
  }

  setupListeners () {
    this.on('do-prompt', this.doPrompt)
  }

  doPrompt (args) {
    type(this.targetEl, ...args)
  }
}

export const pluginPrompt = new PluginPrompt()
