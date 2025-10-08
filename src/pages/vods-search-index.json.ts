import { getCollection } from 'astro:content'

export const prerender = true

// Build-time generated lightweight search index for client-side searching.
// Contains only the minimal fields needed for displaying search results.
export async function GET() {
  const vods = await getCollection('vods')

  const index = vods.map((vod) => {
    const title = vod.data['Title']
    const game = vod.data['Game']
    const date = vod.data['Stream Date']
    const dateISO = date.toISOString()
    const dateDisplay = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    // Tokenization helpers
    const norm = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9\s:.-]/g, ' ')
        .replace(/\s+/g, ' ') // collapse
        .trim()

    const titleTokens = norm(title).split(' ').filter(Boolean)
    const gameTokens = norm(game).split(' ').filter(Boolean)

    const year = date.getFullYear().toString()
    const monthNum = (date.getMonth() + 1).toString()
    const monthNumPadded = monthNum.padStart(2, '0')
    const day = date.getDate().toString()
    const dayPadded = day.padStart(2, '0')
    const monthName = date.toLocaleString('en-US', { month: 'long' }).toLowerCase()
    const monthShort = date.toLocaleString('en-US', { month: 'short' }).toLowerCase()

    const dateTokens = [
      year,
      monthNum,
      monthNumPadded,
      day,
      dayPadded,
      monthName,
      monthShort,
      `${year}-${monthNumPadded}-${dayPadded}`,
      `${monthName}-${year}`,
    ]

    const allTokens = Array.from(
      new Set([...titleTokens, ...gameTokens, ...dateTokens])
    )

    return {
      id: vod.id,
      title,
      game,
      date: dateISO,
      dateDisplay,
      duration: vod.data['Duration'],
      thumbnail: vod.data['Thumbnail URL'],
      tokens: allTokens, // For basic matching (AND semantics client-side)
      // Optional field weights (used client-side to score results)
      _w: {
        title: titleTokens,
        game: gameTokens,
      },
    }
  })

  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), count: index.length, vods: index }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
