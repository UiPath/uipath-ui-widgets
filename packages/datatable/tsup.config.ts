import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'], // ES modules only (since package.json has "type": "module")
  dts: true, // Generate .d.ts files
  sourcemap: false, // No source maps for production
  clean: true, // Clean dist before build
  minify: true, // Minify output
  splitting: false, // Don't split into chunks (better for libraries)
  treeshake: true, // Remove unused code
  outDir: 'dist',
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'ag-grid-react',
    'ag-grid-community',
    '@uipath/uipath-typescript',
  ],
  esbuildOptions(options) {
    // Preserve React JSX
    options.jsx = 'automatic';
    // Target modern browsers
    options.target = 'es2020';
  },
  // Don't bundle SCSS files, just copy them
  loader: {
    '.scss': 'copy',
  },
  onSuccess: async () => {
    console.log('✅ Build successful! JavaScript is minified.');
  },
});
