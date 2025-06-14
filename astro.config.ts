import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
  site: 'https://ltwilson.tv',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    react(),
    icon(),
  ],
  server: {
    port: 1234,
    host: true,
  },
  devToolbar: {
    enabled: true,
  },
})
