import { airtableLoader } from '@ascorbic/airtable-loader'
import { defineCollection, z } from 'astro:content'

const vods = defineCollection({
  loader: airtableLoader({
    base: import.meta.env.AIRTABLE_BASE,
    table: import.meta.env.AIRTABLE_TABLE,
    token: import.meta.env.AIRTABLE_TOKEN,
    queryParams: {
      view: import.meta.env.AIRTABLE_VIEW
    }
  }),
  schema: z.object({
    'Title': z.string(),
    'Stream Date': z.coerce.date(),
    'Duration': z.string(),
    'Game': z.string(),
    'Game Cover URL': z.string().url(),
    'VOD URL': z.string().url(),
    'Thumbnail URL': z.string().url(),
    'Chat Replay URL': z.string().url().optional()
  })
})

export const collections = { vods }