export const dom = (type, content = '', classes = '') => {
  const element = document.createElement(type)
  element.className = classes
  element.innerHTML = content
  return element
}

export const div = (classes, content = '') => dom('div', content, classes)

export const img = (alt, source, classes = '') => {
  const element = dom('img', '', classes)
  element.alt = alt
  element.src = source
  return element
}

export const button = (content, classes = '') => {
  return dom('button', content, `bg-blue-800 m-auto sm:ml-0 px-4 py-1 ${classes}`)
}

export const p = (content, classes = '') => dom('p', content, classes)
