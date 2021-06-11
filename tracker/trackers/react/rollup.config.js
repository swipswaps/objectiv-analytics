import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from '@wessberg/rollup-plugin-ts'; // Official plugin crashes: https://github.com/rollup/plugins/issues/287
import cleanup from 'rollup-plugin-cleanup';
import filesize from 'rollup-plugin-filesize';
import sizes from 'rollup-plugin-sizes';
import { terser } from 'rollup-plugin-terser';

const commonPlugins = [nodeResolve(), commonjs(), ts()];
const minificationPlugins = [cleanup(), terser()];
const statsPlugins = [sizes(), filesize()];

const makeOutput = (format, isMinified) => ({
  file: `dist/index${isMinified ? '.min' : ''}.js`,
  format: format,
  name: 'objectiv',
  sourcemap: true,
  globals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
});

export default [
  // UMD
  {
    input: './src/index.ts',
    output: [makeOutput('umd', false)],
    plugins: [...commonPlugins, ...statsPlugins],
    external: ['react', 'react-dom'],
  },

  // UMD - minified
  {
    input: './src/index.ts',
    output: [makeOutput('umd', true)],
    plugins: [...commonPlugins, ...minificationPlugins, ...statsPlugins],
    external: ['react', 'react-dom'],
  },
];
