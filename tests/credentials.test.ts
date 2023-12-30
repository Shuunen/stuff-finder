import { expect, it } from 'vitest' // eslint-disable-line @typescript-eslint/no-shadow
import { parseClipboard } from '../src/utils/credentials.utils'

it('parseClipboard A empty', () => {
  expect(parseClipboard('')).toMatchInlineSnapshot(`
    {
      "base": "",
      "table": "",
      "token": "",
      "view": "",
      "wrap": "",
    }
  `)
})

it('parseClipboard B invalid', () => {
  expect(parseClipboard('app1238479649646azd46az465azdazd\nhttps://zob.com')).toMatchInlineSnapshot(`
    {
      "base": "",
      "table": "",
      "token": "",
      "view": "",
      "wrap": "",
    }
  `)
})

it('parseClipboard C valid', () => {
  expect(parseClipboard(`"app1238479649646azd46az465azdazd
pat12345654987123azdazdzadazdzadaz465465468479649646azd46az465azdazd
my-table
my-view
kpohj4987_azdzad"`)).toMatchInlineSnapshot(`
  {
    "base": "app1238479649646azd46az465azdazd",
    "table": "my-table",
    "token": "pat12345654987123azdazdzadazdzadaz465465468479649646azd46az465azdazd",
    "view": "my-view",
    "wrap": "kpohj4987_azdzad",
  }
`)
})
