
export function urlToUuid (url: string) {
  // in: https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz
  // out: wrapapicomusejojodeyesjson002code3760052142741
  return url.replace(/https?|\W|wrapAPIKey.+/gu, '')
}

export function getAsin (url: string) {
  // in: https://www.amazon.fr/dp/B07V7GZQJ2 or B07V7GZQJ2
  // out: B07V7GZQJ2
  const split = url.split('/dp/')
  const check = split[1] ?? url
  const regex = /(?<asin>B[\dA-Z]{9}|\d{9}[\dX])/u
  return regex.exec(check)?.groups?.asin
}

/**
 * Normalize a photo url to a standard given size
 * @param url the url to normalize
 * @param size the size to normalize to
 * @returns the normalized url
 */
export function normalizePhotoUrl (url: string, size = 500) {
  return url
    .replace(/._AC.+\.jpg|._S\w\d+_.jpg/u, `._SL${size}_.jpg`) // Amazon
    .replace(/\/w\/\d+\//u, `/w/${size}/`) // KwCdn Temu
    .replace(/\bf=\d+x\d+/u, `f=${size}x${size}`) // Decathlon
    .replace(/_\d+x\d+\.jpg/u, `_${size}x${size}.jpg`) // AliExpress
}

