import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import packageJSON from "./package.json";

const dependencies = Object.keys(packageJSON.dependencies);

export default {
  input: "src/main.tsx",
  external: [...dependencies, "zustand/vanilla"],
  output: {
    dir: "lib",
    format: "cjs",
    banner: "#!/usr/bin/env node",
  },
  plugins: [
    babel({
      babelHelpers: "runtime",
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    }),
    typescript({
      jsx: "react",
      allowSyntheticDefaultImports: true,
    }),
  ],
};
