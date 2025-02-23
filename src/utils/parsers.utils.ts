/* eslint-disable unicorn/no-null, @typescript-eslint/no-magic-numbers */
import { array, boolean, fallback, maxLength, minValue, nonEmpty, nullish, number, object, picklist, pipe, string } from 'valibot'
import { itemBoxes, itemStatus, uuidMaxLength } from '../constants'

const itemRequiredStringSchema = pipe(string(), nonEmpty())

/**
 * List of photos $id stored in the bucket
 * @example ['id123','id-456']
 */

export const itemSchema = object({
  $id: pipe(string(), nonEmpty(), maxLength(uuidMaxLength)),
  barcode: fallback(string(), ''),
  box: fallback(picklist(['', ...itemBoxes]), ''),
  brand: fallback(string(), ''),
  details: fallback(string(), ''),
  drawer: fallback(number(), -1),
  isPrinted: fallback(boolean(), false),
  name: itemRequiredStringSchema,
  photos: fallback(array(string()), []),
  price: fallback(number(), -1),
  reference: itemRequiredStringSchema,
  status: picklist(itemStatus),
})

export const itemsSchema = array(itemSchema)

export const itemModelSchema = object({
  barcode: fallback(nullish(string()), null),
  box: fallback(nullish(picklist(itemBoxes)), null),
  brand: fallback(nullish(string()), null),
  details: fallback(nullish(string()), null),
  drawer: fallback(nullish(picklist([1, 2, 3, 4, 5, 6, 7, 8, 9])), null),
  isPrinted: fallback(boolean(), false),
  name: itemRequiredStringSchema, // required
  photos: fallback(nullish(array(string())), null),
  price: fallback(nullish(pipe(number(), minValue(0))), null),
  reference: itemRequiredStringSchema, // required
  status: picklist(itemStatus), // required
})
