import postcss from 'postcss'
import loader from 'postcss-load-plugins'

let plugins
let processor

export default async (src, options = {}) => {
  if (!plugins) {
    const pluginsInfo = await loader(options.env || process.env)
    plugins = pluginsInfo.plugins
  }
  if (!processor) {
    processor = postcss(plugins)
  }
  const result = await processor.process(src)
  return result.css
}
