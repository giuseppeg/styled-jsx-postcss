import {parse} from 'babylon'
import jsx from 'styled-jsx/babel'
import generate from 'babel-generator'
import traverse from 'babel-traverse'
import {loopWhile} from 'deasync'
import processor from './processor'

const STYLE_COMPONENT = '_JSXStyle'
const STYLE_COMPONENT_CSS = 'css'

export default function ({types: t}) {
  const getCss = exprPath => {
    const {node} = exprPath
    if (t.isStringLiteral(node)) {
      return {
        path: exprPath,
        source: node.value
      }
    }

    if (node.expressions.length === 0) {
      return {
        path: exprPath,
        source: node.quasis[0].value.cooked
      }
    }

    let source = ''
    const replacements = []
    node.expressions.forEach((e, i) => {
      const r = `___styledjsxexpression${i}___`
      source += node.quasis[i].value.cooked + r
      replacements.push({
        replacement: r,
        initial: `$\{${generate(e).code}}`
      })
    })
    source += node.quasis[node.quasis.length - 1].value.cooked

    return {
      path: exprPath,
      replacements,
      source
    }
  }

  const makeExpression = (src, isTemplateLiteral) => {
    if (!isTemplateLiteral) {
      return t.stringLiteral(src)
    }
    // build the expression from src
    let css
    traverse(
      parse(`\`${src}\``),
      {
        TemplateLiteral(path) {
          if (!css) {
            css = path.node
          }
        }
      }
    )
    return css
  }

  return {
    inherits: jsx,
    visitor: {
      JSXOpeningElement: {
        enter(path) {
          const {node} = path.get('name')
          const {name} = node
          if (
            !t.isJSXIdentifier(node) ||
            name !== STYLE_COMPONENT
          ) {
            return
          }

          const processing = path
            // get the attribute containing the css
            .get('attributes').filter(({node}) => (
              node.name.name === STYLE_COMPONENT_CSS
            ))
            // get the value's expression
            .map(cssPath => cssPath.get('value').get('expression'))
            // get the css
            .map(getCss)
            // process the css
            .map(async css => {
              const source = await processor(css.source)
              return {
                ...css,
                source
              }
            })

          let css
          let wait = true
          function resolved(result) {
            css = result
            wait = false
          }
          Promise.all(processing)
            .then(resolved)
            .catch(resolved)
          loopWhile(() => wait)

          if (css instanceof Error) {
            throw css
          }

          // remove placeholders
          // and convert source to JSXExpressionContainer
          css.map(({path, replacements, source}) => ({
            path,
            replacement: makeExpression(
              (
                replacements ?
                replacePlaceholders(
                  replacements,
                  source
                ) :
                source
              ),
              Boolean(replacements)
            )
          }))
          // replace the path
          .forEach(replace)
        }
      }
    }
  }
}

function replacePlaceholders(replacements, src) {
  return replacements.reduce((src, currentReplacement) => {
    src = src.replace(
      currentReplacement.replacement,
      currentReplacement.initial
    )
    return src
  }, src)
}

function replace({path, replacement}) {
  path.replaceWith(replacement)
}
