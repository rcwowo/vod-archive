import { Calendar, Clock, FileQuestion, Gamepad } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useRef, useState } from 'react'

type VodIndexItem = {
  id: string
  title: string
  game: string
  date: string
  dateDisplay: string
  duration: string
  thumbnail: string
  tokens: string[]
  _w: { title: string[]; game: string[] }
}

type IndexResponse = {
  generatedAt: string
  count: number
  vods: VodIndexItem[]
}

interface Props {
  initialQuery?: string
}

interface ScoredVod extends VodIndexItem {
  score: number
}

const fetchIndex = async (): Promise<IndexResponse> => {
  const res = await fetch('/vods-search-index.json')
  if (!res.ok) throw new Error('Failed to load search index')
  return res.json()
}

const normalize = (q: string) =>
  q
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s:.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export default function SearchClient({ initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [index, setIndex] = useState<IndexResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Load index once
  useEffect(() => {
    setIsLoading(true)
    fetchIndex()
      .then((idx) => setIndex(idx))
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  // Sync query param with URL (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      const url = new URL(window.location.href)
      if (query) url.searchParams.set('q', query)
      else url.searchParams.delete('q')
      window.history.replaceState({}, '', url.toString())
    }, 250)
    return () => clearTimeout(handler)
  }, [query])



  // VOD results with scoring
  const vodResults: ScoredVod[] = useMemo(() => {
    if (!index) return []
    const q = normalize(query)
    if (!q) {
      // No query: show nothing, handled by instruction card
      return []
    }
    const parts = q.split(' ').filter(Boolean)
    const matches: ScoredVod[] = []
    outer: for (const vod of index.vods) {
      let score = 0
      for (const token of parts) {
        // Direct token membership OR substring match inside title/game token
        const inTokens = vod.tokens.some((t) => t === token)
        const partial = !inTokens && vod.tokens.some((t) => t.startsWith(token))
        if (!inTokens && !partial) continue outer // AND semantics

        // Scoring weights
        if (vod._w.title.some((t) => t === token)) score += 6
        else if (vod._w.title.some((t) => t.startsWith(token))) score += 4
        else if (vod._w.game.some((t) => t === token)) score += 3
        else if (vod._w.game.some((t) => t.startsWith(token))) score += 2
        else score += 1 // date or generic token
      }
      // Boost newer content lightly
      const ageBoost =
        1 /
        (1 + (Date.now() - Date.parse(vod.date)) / (1000 * 60 * 60 * 24 * 30))
      score += ageBoost
      matches.push({ ...vod, score })
    }
    return matches
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return b.date.localeCompare(a.date)
      })
      .slice(0, 100)
  }, [index, query])

  // Only VOD results
  const combinedResults = useMemo(() => {
    if (!query) return []
    return vodResults
  }, [vodResults, query])

  // UI
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <input
          id="vod-search"
          autoFocus
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Start searching for a VOD..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {query
            ? `${combinedResults.length} result${combinedResults.length === 1 ? '' : 's'} for "${query}"`
            : null}
        </p>
      </div>
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          Failed to load search index: {error}
        </div>
      )}
      {isLoading && !index && (
        <div className="text-sm text-muted-foreground">Loading index…</div>
      )}

      {/* Instruction card when no query */}
      {!query && (
        <div className="bg-card flex flex-col justify-between gap-4 rounded-lg border p-6 shadow-sm sm:flex-row">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Introducing search!</h2>
            <span className="text-left text-sm text-muted-foreground">
              <p>
                You can now find a VOD by simply using keywords to find a VOD,
                game, or date.
              </p>
              <p>See the examples below:</p>
            </span>
            <ul className="list-disc space-y-1 pl-4 font-mono text-sm">
              <li>exit 8</li>
              <li>minecraft january 2024</li>
              <li>morning show</li>
            </ul>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <a
              href="/collection"
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'lg' }),
                'flex h-full w-full flex-col gap-1 px-8 py-2',
              )}
            >
              <span className="flex">
                <Calendar size="20" className="mr-2" />
                Find By Month
              </span>
              <p className="text-xs text-muted-foreground">
                VODs by month and year they aired.
              </p>
            </a>
            <a
              href="/games"
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'lg' }),
                'flex h-full w-full flex-col gap-1 px-8 py-2',
              )}
            >
              <span className="flex">
                <Gamepad size="20" className="mr-2" />
                Find By Game
              </span>
              <p className="text-xs text-muted-foreground">
                Browse VODs by game played.
              </p>
            </a>
          </div>
        </div>
      )}


      {/* VOD results only */}
      {query && combinedResults.length > 0 && (
        <ul className="space-y-4">
          {combinedResults.map((vod, idx) => (
            <li key={vod.id} className="group relative">
              <a
                href={`/watch/${vod.id}`}
                className="bg-card flex items-center gap-4 overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
              >
                <div className="h-20 flex-shrink-0 overflow-hidden rounded-md">
                  <img
                    src={vod.thumbnail}
                    alt={vod.title}
                    loading="lazy"
                    className="aspect-video h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-grow flex-col py-2">
                  <h3 className="line-clamp-2 text-base font-semibold leading-tight">
                    {vod.title}
                  </h3>
                  <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Gamepad size="12" className="mr-1" />
                      {vod.game}
                    </span>
                    <span className="flex items-center">
                      <Calendar size="12" className="mr-1" />
                      {vod.dateDisplay}
                    </span>
                    <span className="flex items-center">
                      <Clock size="12" className="mr-1" />
                      {vod.duration}
                    </span>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {index &&
        query &&
        combinedResults.length === 0 && (
          <div className="bg-card flex flex-col items-center justify-center gap-2 rounded-lg border p-6 text-sm text-muted-foreground shadow-sm">
            <FileQuestion size={32} />
            <p>We couldn't find anything. Try different keywords.</p>
          </div>
        )}
    </div>
  )
}
