import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { api } from '@/api'
import { AcquisitionBadge } from '@/components/AcquisitionBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDecimal } from '@/labels'
import type { AcquisitionType, Plot } from '@/types'

export function PlotsList() {
  const [searchParams] = useSearchParams()
  const [plots, setPlots] = useState<Plot[]>([])
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [acquisitionType, setAcquisitionType] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setQ(searchParams.get('q') ?? '')
  }, [searchParams])

  function refresh() {
    setLoading(true)
    api
      .getPlots({
        q: q || undefined,
        acquisitionType: acquisitionType || undefined,
      })
      .then(setPlots)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
  }, [q, acquisitionType])

  async function onDelete(plot: Plot) {
    if (!confirm(`Delete khesra ${plot.khesra}? This cannot be undone.`)) return
    setError('')
    try {
      await api.deletePlot(plot.id)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plots</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search by khesra, khata, or jamabandi. Edit or delete any holding from here.
          </p>
        </div>
        <Button asChild>
          <Link to="/plots/new">Add plot</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          className="max-w-xs bg-card"
          placeholder="Search khesra / khata…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          value={acquisitionType || 'all'}
          onValueChange={(value) => setAcquisitionType(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-[220px] bg-card">
            <SelectValue placeholder="All acquisition types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All acquisition types</SelectItem>
            <SelectItem value="khatiyan">Khatiyan</SelectItem>
            <SelectItem value="kewala">Kewala</SelectItem>
            <SelectItem value="rashid">Rashid</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card className="py-4">
        <CardHeader className="px-4 pb-2">
          <CardTitle className="text-base">All plots</CardTitle>
          <CardDescription>{loading ? 'Loading…' : `${plots.length} records`}</CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : plots.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No plots match these filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="py-3 pr-3 font-semibold">Khesra</th>
                    <th className="py-3 pr-3 font-semibold">Khata</th>
                    <th className="py-3 pr-3 font-semibold">Jamabandi</th>
                    <th className="py-3 pr-3 font-semibold">Rakba</th>
                    <th className="py-3 pr-3 font-semibold">Type</th>
                    <th className="py-3 pr-3 font-semibold">Owner</th>
                    <th className="py-3 pr-3 font-semibold">Class</th>
                    <th className="py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plots.map((p) => (
                    <tr key={p.id} className="border-b border-border/70 hover:bg-muted/40">
                      <td className="py-3 pr-3 font-semibold">
                        <Link className="hover:text-primary" to={`/plots/${p.id}`}>
                          {p.khesra}
                        </Link>
                      </td>
                      <td className="py-3 pr-3">{p.khata || '—'}</td>
                      <td className="py-3 pr-3">{p.jamabandiNo || '—'}</td>
                      <td className="py-3 pr-3">{formatDecimal(p.rakbaDecimal)}</td>
                      <td className="py-3 pr-3">
                        <AcquisitionBadge type={p.acquisitionType as AcquisitionType} />
                      </td>
                      <td className="py-3 pr-3">{p.ownerName || '—'}</td>
                      <td className="py-3 pr-3">{p.landClass || '—'}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <Button asChild size="icon-sm" variant="ghost">
                            <Link to={`/plots/${p.id}/edit`} aria-label={`Edit khesra ${p.khesra}`}>
                              <Pencil />
                            </Link>
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => void onDelete(p)}
                            aria-label={`Delete khesra ${p.khesra}`}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
