import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  //TREBUIE STEARSA DUPA !!!!!!!!
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      typescript: tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // TREBUIE STERS CE E MAI SUS !!!
];

export default eslintConfig;
