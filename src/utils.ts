import { dom } from 'shuutils'

export const button = (content: string, classes = '', secondary = false): HTMLButtonElement => {
  const theme = secondary ? 'hover:opacity-100 opacity-80' : 'from-purple-500 to-purple-700 text-white hover:from-purple-700 hover:to-purple-900'
  return dom('button', `text-lg md:text-base bg-gradient-to-tr shadow-md hover:shadow-lg rounded transition-all duration-200 each-in-out px-6 py-2 ${theme} ${classes}`, content)
}
