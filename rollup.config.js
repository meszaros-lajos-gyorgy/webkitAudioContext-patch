import uglify from 'rollup-plugin-uglify'
import buble from 'rollup-plugin-buble'
import fs from 'fs'

const getDate = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1)
  const day = (d.getDate() < 10 ? '0' : '') + d.getDate()
  return `${year}-${month}-${day}`
}

const config = JSON.parse(fs.readFileSync('package.json'))

const banner = `// ${config.name} - created by ${config.author} - ${config.license} licence - last built on ${getDate()}`

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