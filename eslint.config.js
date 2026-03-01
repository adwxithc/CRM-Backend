import tseslint from "typescript-eslint";
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // CommonJS files (e.g. jest.config.cjs) need Node/CJS globals
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: { ...globals.node, ...globals.commonjs },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off",
    },
  },
];