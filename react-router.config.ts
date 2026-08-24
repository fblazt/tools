import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  async prerender() {
    return [
      "/",
      "/tools/qr-generator",
      "/tools/jwt-decoder",
      "/tools/image-to-webp",
      "/tools/markdown-previewer",
      "/tools/json-api-tester",
    ];
  },
} satisfies Config;
