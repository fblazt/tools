import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  optimizeDeps: {
    include: [
      "@radix-ui/react-slider",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "qrcode.react",
      "react-colorful",
    ],
  },
});