import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from '@wessberg/rollup-plugin-ts'; // Official plugin crashes: https://github.com/rollup/plugins/issues/287
import cleanup from 'rollup-plugin-cleanup';
import filesize from 'rollup-plugin-filesize';
import sizes from 'rollup-plugin-sizes';
import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'umd',
      name: 'objectivWebDevicePlugin',
    },
  ],
  plugins: [nodeResolve(), commonjs(), ts(), cleanup(), terser(), sizes(), filesize()],
};
