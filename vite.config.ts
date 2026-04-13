import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    headers: {
      "Cache-Control": "no-store",
    },
  },
  optimizeDeps: {
    force: true,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    // Optimized chunking for 400+ concurrent users
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor core — cached across all pages
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["framer-motion", "lucide-react", "sonner", "class-variance-authority", "clsx", "tailwind-merge"],
          "vendor-radix": [
            "@radix-ui/react-dialog", "@radix-ui/react-popover", "@radix-ui/react-select",
            "@radix-ui/react-tabs", "@radix-ui/react-accordion", "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tooltip", "@radix-ui/react-switch", "@radix-ui/react-checkbox",
            "@radix-ui/react-slider", "@radix-ui/react-progress", "@radix-ui/react-scroll-area",
          ],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-i18n": ["i18next", "react-i18next"],
          "vendor-date": ["date-fns"],
          "vendor-charts": ["recharts"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
        // Content-hash for long-term caching
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    // Increase chunk size warning threshold
    chunkSizeWarningLimit: 600,
  },
}));
