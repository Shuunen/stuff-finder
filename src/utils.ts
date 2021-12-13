import { dom, emit } from 'shuutils'

export const button = (content: string, classes = '', secondary = false): HTMLButtonElement => {
  const theme = secondary ? 'hover:opacity-100 opacity-80' : 'from-purple-500 to-purple-700 text-white hover:from-purple-700 hover:to-purple-900'
  const button_ = dom('button', `text-lg h-10 max-w-xs px-12 md:text-base bg-gradient-to-tr shadow-md hover:shadow-lg rounded transition-all duration-200 each-in-out sm:px-6 ${theme} ${classes}`, content)
  button_.type = 'button'
  return button_
}

export const showError = (message: string) => {
  console.error(message)
  emit('app-toaster--show', { type: 'error', message })
}

export const showLog = (message: string, data = '') => {
  console.log(message, data)
  emit('app-toaster--show', { type: 'info', message })
}
