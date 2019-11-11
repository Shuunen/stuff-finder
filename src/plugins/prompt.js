import { type } from '@camwiegert/typical'
import { BaseModel } from '../model'

class PluginPrompt extends BaseModel {
  constructor () {
    super('prompt')
    this.log('constructor')
    this.targetEl = document.querySelector('h1')
    this.on('do-prompt', this.doPrompt)
  }

  doPrompt (args) {
    type(this.targetEl, ...args)
  }
}

export const pluginPrompt = new PluginPrompt()
