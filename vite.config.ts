import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
      name: "lx-editor",
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "@lexical/react"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@lexical/react": "LexicalReact",
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [
    react(),
    libInjectCss(),
    dts({
      insertTypesEntry: true,
      include: ["src/**/*", "index.ts"],
    }),
  ],
});
