import {parse} from 'babylon'
import jsx from 'styled-jsx/babel'
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

    const expressions = exprPath.get('expressions')

    if (expressions.length === 0) {
      return {
        path: exprPath,
        source: node.quasis[0].value.cooked
      }
    }

    const replacements = getPlaceholders(expressions)
    const source = addPlaceholders(
      replacements,
      exprPath.getSource().slice(1, -1)
    )

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

          console.log(!t.isJSXIdentifier(node), name !== STYLE_COMPONENT, name)
          console.log(path.getSource())

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

function getPlaceholders(expressions) {
  return expressions.map((e, id) => ({
    replacement: `___styledjsxexpression${id}___`,
    initial: `$\{${e.getSource()}}`
  })).sort((a, b) => a.initial.length < b.initial.length)
}

function addPlaceholders(replacements, src) {
  return replacements.reduce((src, currentReplacement) => {
    src = src.replace(
      currentReplacement.initial,
      currentReplacement.replacement
    )
    return src
  }, src)
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
