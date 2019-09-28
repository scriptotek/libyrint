import { template } from 'lodash/string'

function compileTemplate(tplString, tplArgs) {
  return template(tplString, {
    interpolate: /{{([\s\S]+?)}}/g
  })(tplArgs)
}

export {
  compileTemplate
}
