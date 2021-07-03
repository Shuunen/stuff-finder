import { dom } from 'shuutils'

export const button = (content: string, classes = ''): HTMLButtonElement => {
  return dom('button', `bg-gradient-to-tr from-purple-500 to-purple-700 shadow-md text-white rounded  transition-all duration-200 each-in-out hover:from-purple-700 hover:to-purple-900 px-4 py-2 ${classes}`, content)
}
