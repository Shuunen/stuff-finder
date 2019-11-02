import { BaseModel } from '../model'
import { pickOne } from 'shuutils'

class PluginDom extends BaseModel {
  constructor () {
    super('dom')
    this.log('constructor')
    window.emit = (...args) => this.emit.apply(this, args)
    // temp fix while require/imports not allowed in <script> tags
    window.BaseModel = BaseModel
    window.pickOne = pickOne
  }
}

export const pluginDom = new PluginDom()
