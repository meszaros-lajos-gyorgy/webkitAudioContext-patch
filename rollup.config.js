import uglify from 'rollup-plugin-uglify'
import buble from 'rollup-plugin-buble'

const {
  name,
  author,
  license
} = require('./package.json')

const lPadZero = num => (num < 10 ? '0' : '') + num

const getDate = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = lPadZero(d.getMonth() + 1)
  const day = lPadZero(d.getDate())
  return `${year}-${month}-${day}`
}

const banner = `// ${name} - created by ${author} - ${license} licence - last built on ${getDate()}`

export default [{
  entry: 'src/webkit-audio-context-patch.js',
  dest: 'dist/webkit-audio-context-patch.min.js',
  format: 'es',
  sourceMap: true,
  plugins: [
    buble(),
    uglify({
      output: {
        preamble: banner
      }
    })
  ]
}, {
  banner,
  entry: 'src/webkit-audio-context-patch.js',
  dest: 'dist/webkit-audio-context-patch.js',
  format: 'es',
  sourceMap: false,
  plugins: [
    buble()
  ]
}, {
  entry: 'src/audio-param-value-patch.js',
  dest: 'dist/audio-param-value-patch.min.js',
  format: 'es',
  sourceMap: true,
  plugins: [
    buble(),
    uglify({
      output: {
        preamble: banner
      }
    })
  ]
}, {
  banner,
  entry: 'src/audio-param-value-patch.js',
  dest: 'dist/audio-param-value-patch.js',
  format: 'es',
  sourceMap: false,
  plugins: [
    buble()
  ]
}, {
  entry: 'src/polyfill.js',
  dest: 'dist/polyfill.min.js',
  format: 'es',
  sourceMap: true,
  plugins: [
    buble(),
    uglify({
      output: {
        preamble: banner
      }
    })
  ]
}, {
  banner,
  entry: 'src/polyfill.js',
  dest: 'dist/polyfill.js',
  format: 'es',
  sourceMap: false,
  plugins: [
    buble()
  ]
}]