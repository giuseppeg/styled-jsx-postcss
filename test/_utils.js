import {resolve as resolvePath} from 'path'
import {transformFile} from 'babel-core'
import {readFile} from 'mz/fs'

import plugin from '../src/babel'

/**
  borrowed from (c) styled-jsx
  https://github.com/zeit/styled-jsx
*/
export const read = async path => {
  const buffer = await readFile(resolvePath(__dirname, path))
  return buffer.toString()
}

export default (file, opts = {}) => (
  new Promise((resolve, reject) => {
    transformFile(resolvePath(__dirname, file), {
      babelrc: false,
      plugins: [plugin],
      ...opts
    }, (err, data) => {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  })
)
