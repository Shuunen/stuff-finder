const asinRegex = /(?<asin>B[\dA-Z]{9}|\d{9}[\dX])/u
const photoRegex = {
  aliexpress: /_\d+x\d+q?\d?\d?\.jpg.*/u,
  amazon: /._AC.+\.jpg|._S\w\d+_.jpg/u,
  decathlon: /\bf=\d+x\d+/u,
  temu: /\/w\/\d+\//u,
}

/**
 * Transform and url to uuid
 * @param url the url
 * @returns the uuid
 */
export function urlToUuid (url: string) {
  // in: https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz
  // out: wrapapicomusejojodeyesjson002code3760052142741
  return url.replace(/https?|\W|wrapAPIKey.+/gu, '')
}

/**
 * Get the asin from an Amazon url
 * @param url the url
 * @returns the asin
 */
export function getAsin (url: string) {
  // in: https://www.amazon.fr/dp/B07V7GZQJ2 or B07V7GZQJ2
  // out: B07V7GZQJ2
  const split = url.split('/dp/')
  const check = split[1] ?? url
  return asinRegex.exec(check)?.groups?.asin
}

/**
 * Normalize a photo url to a standard given size
 * @param url the url to normalize
 * @param size the size to normalize to
 * @returns the normalized url
 */
export function normalizePhotoUrl (url: string, size = 500) {
  return url
    .replace(photoRegex.amazon, `._SL${size}_.jpg`)
    .replace(photoRegex.temu, `/w/${size}/`)
    .replace(photoRegex.decathlon, `f=${size}x${size}`)
    .replace(photoRegex.aliexpress, `_${size}x${size}q85.jpg`)
}

