// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://tei.net.pl", // Update this with your actual domain
  integrations: [tailwind()],
});
