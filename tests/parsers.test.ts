import { safeParse } from 'valibot'
import { expect, it } from 'vitest'
import { airtableSingleResponseSchema, type AirtableSingleRecordResponse } from '../src/utils/parsers.utils'

const validSingleResponse = {
  createdTime: '2021-01-01T00:00:00.000Z',
  fields: {
    'barcode': '1234567890',
    'box': 'A',
    'brand': 'Brand',
    'category': 'Category',
    'details': 'Details',
    'drawer': 'Drawer',
    'location': 'Location',
    'name': 'Name',
    'ref-printed': true,
    'reference': 'Reference',
    'status': 'acheté',
    'updated-on': '2021-01-01T00:00:00.000Z',
  },
  id: 'rec1234567890',
} satisfies AirtableSingleRecordResponse

it('airtableSingleResponseSchema A empty object', () => {
  expect(safeParse(airtableSingleResponseSchema, {})).toMatchSnapshot()
})

it('airtableSingleResponseSchema B missing fields', () => {
  const response = {
    ...validSingleResponse,
    fields: undefined,
  }
  const result = safeParse(airtableSingleResponseSchema, response)
  expect(result).toMatchSnapshot()
})

it('airtableSingleResponseSchema C valid', () => {
  const result = safeParse(airtableSingleResponseSchema, validSingleResponse)
  expect(result).toMatchSnapshot()
})
