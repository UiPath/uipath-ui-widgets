import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
// This config is used for both rolldown-vite (dev/build) and standard vite (tests)
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      '@uipath/ui-widgets-datatable': path.resolve(__dirname, './packages/datatable/src'),
      '@uipath/datatable': path.resolve(__dirname, './packages/datatable/src'),
    },
    dedupe: ["react", "react-dom"],
  },
})
