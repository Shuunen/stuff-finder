
export const urlToUuid = (url: string): string => {
  // in: https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz
  // out: wrapapicomusejojodeyesjson002code3760052142741
  return url.replace(/(https?|\W|wrapAPIKey.+)/g, '')
}

export const getAsin = (url: string): string | undefined => {
  // in: https://www.amazon.fr/dp/B07V7GZQJ2 or B07V7GZQJ2
  // out: B07V7GZQJ2
  const split = url.split('/dp/')
  const check = split[1] ?? url
  const regex = /(B[\dA-Z]{9}|\d{9}(X|\d))/
  const match = regex.exec(check) ?? []
  return match[1]
}

export const normalizePhotoUrl = (url: string): string => {
  // in: https://m.media-amazon.com/images/I/41eTyK5fGVL._SY90_.jpg or https://m.media-amazon.com/images/I/41eTyK5fGVL._AC_SL1500_.jpg
  // out: https://m.media-amazon.com/images/I/41eTyK5fGVL._SL500_.jpg
  const finalUrl = url.replace(/(._AC_SL\d+_.jpg|._SY\d+_.jpg)/, '._SL500_.jpg')
  return finalUrl
}
