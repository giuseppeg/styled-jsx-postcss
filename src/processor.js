import postcss from 'postcss'
import loader from 'postcss-load-plugins'

let plugins
let processor

export default async (src, options = {}) => {
  if (!plugins) {
    plugins = await loader(options.env || process.env)
  }
  if (!processor) {
    processor = postcss(plugins)
  }
  const result = await processor.process(src)
  return result.css
}
