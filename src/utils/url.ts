
export const urlToUuid = (url: string): string => {
  // in: https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=3760052142741&wrapAPIKey=xyz
  // out: wrapapicomusejojodeyesjson002code3760052142741
  return url.replace(/(https?|\W|wrapAPIKey.+)/g, '')
}
