// astro.config.mjs — integrations: expressive-code, mdx, katex
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import expressiveCode from "astro-expressive-code";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SITE_URL } from "./src/config/constants";

export default defineConfig({
  site: SITE_URL, // sourced from src/config/constants.ts — update there at deploy
  integrations: [
    expressiveCode({
      themes: ["github-dark"],
      styleOverrides: { borderRadius: "6px" },
    }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
