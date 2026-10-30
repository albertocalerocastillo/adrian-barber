// Reglas propias de la guía de estilos (wiki de TMS) que ESLint no trae.

// #region Constantes
// Signos con los que puede acabar un comentario.
const FINALES_VALIDOS = ['.', '?', '!', '…']

// Comentarios que no son texto: regiones, directivas de ESLint y separadores.
const PATRON_IGNORADO = /^(#(end)?region\b|eslint|global\s|@ts-|─|═)/

// Signos tras los que no se puede añadir el punto solo (habría que reescribir).
const FINALES_SIN_ARREGLO = [':', ',', ';', '-', '→']
// #endregion

// #region Comentarios
/**
 * Junta los comentarios de línea seguidos (un párrafo partido en varias
 * líneas) para revisar solo la primera y la última de cada grupo.
 */
const agruparComentarios = (comentarios) => {
  const result = []
  for (const comentario of comentarios) {
    if (PATRON_IGNORADO.test(textoComentario(comentario))) continue
    const anterior = result.at(-1)?.at(-1)
    const seguido =
      anterior &&
      comentario.type === 'Line' &&
      anterior.type === 'Line' &&
      comentario.loc.start.line === anterior.loc.end.line + 1 &&
      comentario.loc.start.column === anterior.loc.start.column
    if (seguido) result.at(-1).push(comentario)
    else result.push([comentario])
  }
  return result
}

/** Texto de un comentario sin los asteriscos de los bloques. */
const textoComentario = (comentario) =>
  comentario.value
    .split('\n')
    .map((linea) => linea.replace(/^\s*\*?\s?/, ''))
    .join('\n')
    .trim()

const comentarioConPunto = {
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: { description: 'Los comentarios empiezan en mayúscula y acaban en punto.' },
    messages: {
      punto: 'El comentario debe acabar en punto.',
      mayuscula: 'El comentario debe empezar en mayúscula.',
    },
  },
  create(context) {
    const codigo = context.sourceCode
    return {
      Program() {
        const grupos = agruparComentarios(codigo.getAllComments())
        for (const grupo of grupos) {
          const primero = textoComentario(grupo[0])
          const ultimo = grupo.at(-1)
          const textoUltimo = textoComentario(ultimo)
          if (!primero || PATRON_IGNORADO.test(primero) || primero.startsWith('/')) continue

          const letra = primero.match(/\p{L}/u)?.[0]
          if (letra && primero.startsWith(letra) && letra !== letra.toUpperCase()) {
            context.report({ loc: grupo[0].loc, messageId: 'mayuscula' })
          }

          const final = textoUltimo.at(-1)
          const conParentesis = final === ')' && FINALES_VALIDOS.includes(textoUltimo.at(-2))
          if (FINALES_VALIDOS.includes(final) || conParentesis || /^https?:\/\/\S+$/.test(textoUltimo.split(/\s/).at(-1))) continue
          context.report({
            loc: ultimo.loc,
            messageId: 'punto',
            fix: FINALES_SIN_ARREGLO.includes(final)
              ? null
              : (fixer) => {
                  const [inicio, fin] = ultimo.range
                  const original = codigo.text.slice(inicio, fin)
                  const cierre = ultimo.type === 'Block' ? original.match(/\s*\*\/$/)[0] : ''
                  const cuerpo = original.slice(0, original.length - cierre.length).trimEnd()
                  return fixer.replaceTextRange([inicio, fin], `${cuerpo}.${cierre}`)
                },
          })
        }
      },
    }
  },
}
// #endregion

// #region Summary
/** Nombres que exporta el módulo (export const/function y export default X). */
const nombresExportados = (programa) => {
  const result = new Set()
  for (const nodo of programa.body) {
    if (nodo.type === 'ExportDefaultDeclaration' && nodo.declaration.type === 'Identifier') {
      result.add(nodo.declaration.name)
    }
    if (nodo.type === 'ExportNamedDeclaration') {
      for (const especificador of nodo.specifiers) result.add(especificador.local.name)
    }
  }
  return result
}

/** ¿El nodo es una función (declarada o como flecha en una constante)? */
const esFuncion = (nodo) =>
  nodo?.type === 'FunctionDeclaration' ||
  (nodo?.type === 'VariableDeclaration' &&
    ['ArrowFunctionExpression', 'FunctionExpression'].includes(nodo.declarations[0]?.init?.type))

const summaryEnExportadas = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Toda función exportada (pública) lleva su bloque Summary /** … */.' },
    messages: { summary: 'Falta el Summary (/** … */) de «{{nombre}}».' },
  },
  create(context) {
    const codigo = context.sourceCode
    return {
      Program(programa) {
        const exportados = nombresExportados(programa)
        for (const sentencia of programa.body) {
          const exportada = sentencia.type.startsWith('Export') && sentencia.declaration
          const nodo = exportada ? sentencia.declaration : sentencia
          if (!esFuncion(nodo)) continue
          const nombre = nodo.id?.name ?? nodo.declarations?.[0].id.name
          if (!exportada && !exportados.has(nombre)) continue
          const tieneSummary = codigo
            .getCommentsBefore(sentencia)
            .some((comentario) => comentario.type === 'Block' && comentario.value.startsWith('*'))
          if (!tieneSummary) context.report({ node: sentencia, messageId: 'summary', data: { nombre } })
        }
      },
    }
  },
}
// #endregion

export default {
  rules: {
    'comentario-con-punto': comentarioConPunto,
    'summary-en-exportadas': summaryEnExportadas,
  },
}
