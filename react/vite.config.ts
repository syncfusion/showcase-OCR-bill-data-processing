import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The legacy ASP.NET Core app hosts this bundle under /aspnet-core-ocr-bill-data-processing/react/.
// Vite's `base` keeps the build's asset URLs consistent with that prefix; in `npm run dev`
// (where the prefix is empty), it falls back to "/". The runtime basePath() helper still
// wins for API calls because the build itself is mounted at the prefix.
export default defineConfig({
  plugins: [react()],
  base: '/ocr-bill-data-processing/react/',
  build: {
    chunkSizeWarningLimit: 8_000_000,
    rollupOptions: {
      output: {
        // Function form: matches rolldown's expectation in Vite 8 (workflow
        // baseline: factory/standards/app-source-baseline.md, "Loading
        // states", "Heavy controls load inside their page"). Each heavy
        // Syncfusion control lands in its own chunk so the entry stays small.
        manualChunks(id) {
          if (id.includes('@syncfusion/ej2-react-pdfviewer')) return 'pdfviewer';
          if (id.includes('@syncfusion/ej2-react-spreadsheet')) return 'spreadsheet';
          if (id.includes('@syncfusion/ej2-react-grids')) return 'grid';
          if (
            id.includes('@syncfusion/ej2-react-buttons') ||
            id.includes('@syncfusion/ej2-react-popups') ||
            id.includes('@syncfusion/ej2-base')
          ) {
            return 'foundation';
          }
          return undefined;
        }
      }
    }
  }
});
