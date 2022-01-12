/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import pkg from './package.json';
import sizes from 'rollup-plugin-sizes';
import ts from 'rollup-plugin-ts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: `dist/index.js`,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [nodeResolve({ browser: true }), commonjs(), ts(), terser(), sizes(), filesize()],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  },
];
