import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: './dist',
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@hatsprotocol/sdk-v1-subgraph', 'graphql', 'graphql-request'],
  tsconfig: './tsconfig.json',
});
