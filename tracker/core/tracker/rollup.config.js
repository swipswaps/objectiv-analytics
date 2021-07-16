import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import filesize from 'rollup-plugin-filesize';
import sizes from 'rollup-plugin-sizes';
import { terser } from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';

const commonPlugins = [nodeResolve(), commonjs(), ts()];
const minificationPlugins = [cleanup(), terser()];
const statsPlugins = [sizes(), filesize()];

const makeOutput = (isMinified) => ({
  file: `dist/index${isMinified ? '.min' : ''}.js`,
  format: 'es',
  name: 'ObjectivCoreTracker',
  sourcemap: true,
});

function silenceCircularDependencyWarnings(warning, rollupWarn) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    rollupWarn(warning);
  }
}

export default [
  // ES
  {
    input: './src/index.ts',
    output: [makeOutput(false)],
    plugins: [...commonPlugins, ...statsPlugins],
    onwarn: silenceCircularDependencyWarnings,
  },

  // ES minified
  {
    input: './src/index.ts',
    output: [makeOutput(true)],
    plugins: [...commonPlugins, ...minificationPlugins, ...statsPlugins],
    onwarn: silenceCircularDependencyWarnings,
  },
];
