import { BaseModel } from '../model'

class PluginDom extends BaseModel {
  constructor () {
    super('dom')
    this.log('constructor')
    window.emit = (...args) => this.emit.apply(this, args)
    // temp fix while require/imports not allowed in <script> tags
    window.BaseModel = BaseModel
  }
}

export const pluginDom = new PluginDom()
