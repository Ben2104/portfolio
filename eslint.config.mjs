import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [".next/**", "node_modules/**", "prototype/**", ".verify/**"],
  },
];

export default eslintConfig;
