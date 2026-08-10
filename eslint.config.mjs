import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // Markdown images have author-defined dimensions and arbitrary GitHub
      // origins, so native lazy loading is the correct renderer here.
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["*.config.js", "tailwind.config.js", "postcss.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["components/Editor.tsx"],
    rules: {
      // This effect synchronizes the editor with its URL and invokes async
      // loaders; their state updates occur only after network awaits.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".wrangler/**",
    "node_modules/**",
    "tinymind-extension/**",
  ]),
]);
