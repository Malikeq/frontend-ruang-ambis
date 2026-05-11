// @ts-nocheck — this file is read by opennextjs-cloudflare, not Next.js
// Types are resolved at build time via npx opennextjs-cloudflare

/** @type {import("opennextjs-cloudflare").OpenNextConfig} */
const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },

  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
    },
  },
};

export default config;
