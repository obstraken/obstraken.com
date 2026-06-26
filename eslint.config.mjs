import { fixupConfigRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...fixupConfigRules(nextVitals),
  ...fixupConfigRules(nextTs),
  {
    rules: {
      "react/display-name": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "next-env.d.ts"]),
]);

export default eslintConfig;
