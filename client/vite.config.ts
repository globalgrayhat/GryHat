import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import checker from "vite-plugin-checker";

export default defineConfig(({ mode }) => {
  // Suppress Node.js version warning
  process.env.VITE_CJS_IGNORE_WARNING = "true";

  const env = loadEnv(mode, process.cwd(), "");

  // Only expose safe environment variables
  const safeEnv = {
    NODE_ENV: mode,
    VITE_GOOGLE_CLIENT_ID: env.VITE_GOOGLE_CLIENT_ID || "",
    VITE_STRIPE_PUBLISHABLE_KEY: env.VITE_STRIPE_PUBLISHABLE_KEY || "",
    VITE_REDIRECT_URI: env.VITE_REDIRECT_URI || "",
    VITE_API_BASE_URL: env.VITE_API_BASE_URL || "",
    VITE_CLOUDFRONT_BASE: env.VITE_CLOUDFRONT_BASE || "",
  };

  return {
    plugins: [
      react({
        // jsxRuntime: 'automatic',
        jsxImportSource: "react",
      }),
      checker({
        typescript: true,
        overlay: true,
      }),
    ],

    server: {
      port: 3000,
      open: false,
      host: "localhost",
      strictPort: true,
      // Reduce network URL spam - only show localhost
      hmr: {
        host: "localhost",
      },
    },

    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "router-vendor": ["react-router-dom"],
            "ui-vendor": ["@material-tailwind/react"],
            "redux-vendor": ["react-redux", "redux-persist"],
          },
        },
      },
    },

    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@components": resolve(__dirname, "./src/components"),
        // "@pages": resolve(__dirname, "./src/pages"),
        "@utils": resolve(__dirname, "./src/utils"),
        "@hooks": resolve(__dirname, "./src/hooks"),
        "@contexts": resolve(__dirname, "./src/contexts"),
        "@api": resolve(__dirname, "./src/api"),
        "@redux": resolve(__dirname, "./src/redux"),
        "@types": resolve(__dirname, "./src/types"),
        "@constants": resolve(__dirname, "./src/constants"),
        "@validations": resolve(__dirname, "./src/validations"),
      },
    },

    define: Object.fromEntries(
      Object.entries(safeEnv).map(([key, value]) => [
        `process.env.${key}`,
        JSON.stringify(value),
      ])
    ),

    css: {
      modules: {
        localsConvention: "camelCase",
      },
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@material-tailwind/react",
        "react-redux",
        "redux-persist",
      ],
    },
  };
});
