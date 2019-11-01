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
    this.on('do-prompt-intent', this.doPromptIntent)
  }

  doPrompt (text) {
    type(this.targetEl, text)
  }

  doPromptIntent (data) {
    type(this.targetEl, this.translateIntent(data.intent, data.stuff))
  }

  translateIntent (intent, stuff = '') {
    switch (intent) {
      case 'looking-for':
        return `Vous cherchez ${stuff} ?`
      case 'want-to-store':
        return `Vous voulez ranger ${stuff} ?`
      default:
        return 'Je ne connais pas ce besoin'
    }
  }
}

export const pluginPrompt = new PluginPrompt()
