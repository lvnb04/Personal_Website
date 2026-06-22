// src/content.config.ts — content collections: blog (.mdx) + projects (.md).
// Schemas per CLAUDE.md §7. Adding content = drop one file in the folder; no code change.
//
// `thumbnail` uses Astro's image() helper so real PNG/SVG assets are optimized and
// type-checked. It is optional during the placeholder phase — when absent, the shared
// Tile renders an on-brand placeholder so grids never look broken (see docs/decisions.md).

import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      description: z.string(),
      thumbnail: image().optional(),
      updated: z.coerce.date().optional(),
    }),
});

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      stack: z.array(z.string()).default([]),
      repo: z.string().url().optional(),
      demo: z.string().url().optional(),
      blog: z.string().optional(), // related blog post slug
      // thumbnail accepts EITHER a plain `/`-URL into public/ OR a pipeline asset
      // (image(), from src/assets). String is tried FIRST so a `/`-URL validates
      // as-is instead of image() trying (and failing) to resolve it as an asset.
      // The Tile handles both: string → plain <img>; ImageMetadata → <Image>.
      thumbnail: z.union([z.string(), image()]).optional(),
      // animated thumbnail (hover-to-play). A `/`-relative URL into public/ — NOT
      // image(): Astro's pipeline strips animation, so motion assets bypass it.
      motion: z.string().optional(),
      status: z.enum(["deployed", "archived", "in-training"]).optional(),
      order: z.number().optional(),
      // CSS object-fit for the thumbnail; defaults to 'cover' when absent
      imgFit: z.string().optional(),
    }),
});

export const collections = { blog, projects };
