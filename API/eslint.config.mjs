import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
  {
    files: ["./src/**/*.{js,mjs,cjs,ts}"],
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "comma-dangle": ["error", "always-multiline"],
      complexity: ["error", 15],
      quotes: ["error", "double"],
      semi: ["error", "always"],
    },
  },
];
