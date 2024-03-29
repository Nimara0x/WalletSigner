import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default () => {
  return defineConfig({
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    plugins: [nodePolyfills()],
  });
};
