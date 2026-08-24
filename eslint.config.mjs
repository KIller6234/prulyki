import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This project does not enable the React Compiler (next.config.ts has
      // no `reactCompiler: true`), and standard "reset state, then fetch"
      // data-fetching effects — the pattern React's own docs recommend
      // (https://react.dev/learn/synchronizing-with-effects#fetching-data)
      // — trip this Compiler-oriented rule. Re-enable once the Compiler is
      // adopted and effects are migrated to its patterns.
      "react-hooks/set-state-in-effect": "off",
      // Convention used across provider/interface implementations for
      // intentionally-unused params required by a shared interface shape.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
