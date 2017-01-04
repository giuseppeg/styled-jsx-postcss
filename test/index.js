import test from 'ava'

import transform, {read} from './_utils'

test('applies plugins', async t => {
  const {code} = await transform('./fixtures/basic.js')
  const out = await read('./fixtures/basic.out.js')
  t.is(code, out.trim())
})
