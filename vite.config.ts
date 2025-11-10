import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  optimizeDeps: {
    // Include all React Router and React dependencies explicitly
    include: [
      "react",
      "react/jsx-runtime",
      "react-dom",
      "react-dom/client",
      "react-router",
      "react-router-dom",
      "@radix-ui/react-select",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-popover",
      "@radix-ui/react-label",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
    ],
    // Exclude React Router internal files from pre-bundling
    // These are handled by the React Router plugin
    exclude: [
      "@react-router/dev",
      "@react-router/node",
    ],
    // Force re-optimization on startup if cache is stale
    // This will be overridden by the clean script, but helps with detection
    esbuildOptions: {
      target: "es2022",
    },
  },
  resolve: {
    // Ensure proper resolution of React Router dependencies
    dedupe: ["react", "react-dom", "react-router", "react-router-dom"],
  },
  server: {
    // Improve HMR reliability
    hmr: {
      overlay: true,
    },
    // Increase timeout for dependency optimization
    fs: {
      strict: false,
    },
    // Increase timeout for dependency pre-bundling
    watch: {
      usePolling: false,
    },
  },
  // Clear cache on build
  clearScreen: false,
  // Build configuration
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
});
