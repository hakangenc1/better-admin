import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [tsconfigPaths(), tailwindcss(), reactRouter()],
  optimizeDeps: {
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
    exclude: [
      "@react-router/dev",
      "@react-router/node",
      "better-sqlite3", // Add this - don't optimize for browser
    ],
    esbuildOptions: {
      target: "es2022",
    },
  },
  // Add SSR configuration
  ssr: {
    noExternal: [],
    external: ["better-sqlite3"], // Keep server-only
  },
  resolve: {
    dedupe: ["react", "react-dom", "react-router", "react-router-dom"],
    alias: {
      "~": path.resolve(__dirname, "app"),
      "@": path.resolve(__dirname, "app"),
    },
  },
  server: {
    hmr: {
      overlay: true,
    },
    fs: {
      strict: false,
    },
    watch: {
      usePolling: false,
    },
  },
  clearScreen: false,
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    // Add rollup options to handle build warnings
    rollupOptions: {
      external: ["better-sqlite3"], // Don't bundle for client
      onwarn(warning, warn) {
        // Suppress sourcemap warnings
        if (warning.code === 'SOURCEMAP_ERROR') return;
        // Suppress external module warnings for known server-only deps
        if (
          warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
          (warning.code === 'UNRESOLVED_IMPORT' && 
           warning.message.includes('better-sqlite3'))
        ) return;
        warn(warning);
      }
    }
  },
});