import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import wiki from './eslint-rules/wiki.js'

// Normas de la guía de estilos (wiki de TMS) que se pueden comprobar solas.
// Las de nombres (result, conceptos raíz, regiones) se revisan a mano.
const reglasWiki = {
  // Variables: nada de var y let solo si no puede ser const.
  'no-var': 'error',
  'prefer-const': 'error',

  // Funciones: siempre flecha y async/await en vez de .then().
  'func-style': ['error', 'expression'],
  'prefer-arrow-callback': 'error',
  'no-restricted-syntax': [
    'error',
    {
      selector: "CallExpression[callee.property.name='then']",
      message: 'Usa async/await en vez de .then().',
    },
  ],
  'no-use-before-define': ['error', { functions: false, classes: true, variables: false }],

  // Comentarios: en la línea anterior, con espacio, mayúscula y punto.
  'line-comment-position': ['error', { position: 'above' }],
  'no-inline-comments': ['error', { ignorePattern: '#(end)?region' }],
  'spaced-comment': ['error', 'always', { block: { balanced: true } }],
  'wiki/comentario-con-punto': 'error',
  'wiki/summary-en-exportadas': 'error',
}

export default defineConfig([
  globalIgnores(['dist', 'supabase/functions']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    plugins: { wiki },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: reglasWiki,
  },
  {
    files: ['*.config.js', 'eslint-rules/**', 'scripts/**'],
    languageOptions: { globals: globals.node },
  },
])
