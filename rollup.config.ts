import { defineConfig } from 'rollup';
import json from '@rollup/plugin-json';
import rollupTypescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const config = defineConfig({
  input: 'src/cli.ts',
  output: {
    dir: 'dist',
    chunkFileNames: 'dep.js',
    format: 'es',
  },
  plugins: [
    rollupTypescript(),
    json(),
    resolve({ preferBuiltins: true }),
    commonjs(),
    terser(),
  ],
});

export default config;
