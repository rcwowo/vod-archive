import rss from '@astrojs/rss'
import { SITE } from '@/consts'
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'

export async function GET(context: APIContext) {
  try {
    const vods = (await getCollection('vods'))

    // Sort posts by date
    const items = [...vods].sort(
      (a, b) =>
        new Date(b.data['Stream Date']).valueOf() - new Date(a.data['Stream Date']).valueOf(),
    )

    // Return RSS feed
    return rss({
      title: SITE.TITLE,
      description: SITE.DESCRIPTION,
      site: context.site ?? SITE.SITEURL,
      items: items.map((item) => ({
        title: item.data.Title,
        categories: [item.data.Game],
        description: `A stream that lasted ${item.data.Duration} while playing ${item.data.Game}.`,
        pubDate: item.data['Stream Date'],
        link: `/watch/${item.id}/`,
      })),
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}
