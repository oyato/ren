import typescript from 'rollup-plugin-typescript'
import { terser } from 'rollup-plugin-terser'

export default {
  plugins: [typescript(), terser({})],
  input: './index.ts',
  output: {
    format: 'iife',
    file: './dist/o-ren.min.js',
    name: 'oyato$oren',
  },
}
