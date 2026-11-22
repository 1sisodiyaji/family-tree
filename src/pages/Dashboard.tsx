import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LandPlot, MapPinned, Plus, Users } from 'lucide-react'
import { api } from '@/api'
import { AcquisitionBadge } from '@/components/AcquisitionBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { acquisitionLabels, formatAcre, formatDecimal } from '@/labels'
import { cn } from '@/lib/utils'
import type { MaujaConfig, Plot, Stats } from '@/types'

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [config, setConfig] = useState<MaujaConfig | null>(null)
  const [plots, setPlots] = useState<Plot[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getStats(), api.getConfig(), api.getPlots()])
      .then(([s, c, p]) => {
        setStats(s)
        setConfig(c)
        setPlots(p)
        setSelectedId(p[0]?.id ?? null)
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  const selected = useMemo(
    () => plots.find((p) => p.id === selectedId) ?? plots[0] ?? null,
    [plots, selectedId]
  )

  if (error) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Could not load dashboard</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!stats || !config) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    )
  }

  const maujaLabel = config.maujaName
    ? `${config.maujaName} · Thana ${config.thanaNo}`
    : `Mauja Thana ${config.thanaNo}`

  const totalPlots = stats.plotCount || 1
  const shareOfPortfolio = selected
    ? Math.round((selected.rakbaDecimal / (stats.totalDecimal || 1)) * 100)
    : 0

  const acquisitionShare = [
    { key: 'khatiyan', label: 'Khatiyan', ...stats.byAcquisition.khatiyan },
    { key: 'kewala', label: 'Kewala', ...stats.byAcquisition.kewala },
    { key: 'rashid', label: 'Rashid', ...stats.byAcquisition.rashid },
  ] as const

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Portfolio for <span className="font-semibold text-foreground">{maujaLabel}</span>
            {config.district ? ` · ${config.district}` : ''}.
          </p>
        </div>
        <Button asChild>
          <Link to="/plots/new">
            <Plus />
            Add plot
          </Link>
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total rakba"
          value={Number(stats.totalDecimal).toLocaleString('en-IN', { maximumFractionDigits: 4 })}
          unit="decimal"
          hint={formatAcre(stats.totalAcre)}
          delta={`${stats.plotCount} plots`}
        />
        <KpiCard
          label="Khatiyan / Kewala"
          value={String(
            stats.byAcquisition.khatiyan.count + stats.byAcquisition.kewala.count
          )}
          unit="plots"
          hint={`${stats.byAcquisition.rashid.count} rashid-backed`}
          delta={`${pct(
            stats.byAcquisition.khatiyan.count + stats.byAcquisition.kewala.count,
            totalPlots
          )}% strong title`}
        />
        <KpiCard
          label="Family members"
          value={String(stats.familyMemberCount ?? 0)}
          unit="people"
          hint={`${stats.livingMemberCount ?? 0} living`}
          delta="Vanshavali ready"
        />
        <KpiCard
          label="Avg plot size"
          value={
            stats.plotCount
              ? Number(stats.totalDecimal / stats.plotCount).toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                })
              : '0'
          }
          unit="decimal"
          hint={formatDecimal(stats.byAcquisition.khatiyan.totalDecimal) + ' ancestral'}
          delta={`${stats.plotCount} holdings`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.65fr_0.85fr]">
        <Card className="overflow-hidden py-4">
          <CardContent className="space-y-4 px-4 h-full">
            {selected ? (
              <>
                <div className="relative min-h-[340px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300">
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="plot-iso relative aspect-[1.35] w-[min(72%,420px)]">
                      <div className="absolute inset-[8%_18%_28%_8%] rounded-xl bg-gradient-to-br from-lime-500 to-green-800 shadow-xl" />
                      <div className="absolute inset-[18%_8%_12%_48%] rounded-xl bg-gradient-to-br from-amber-400 to-orange-700 shadow-xl" />
                      <div className="absolute inset-[55%_42%_8%_12%] rounded-xl bg-gradient-to-br from-lime-400 to-lime-800 shadow-xl" />
                      <div className="absolute top-[-8%] left-[35%] h-[120%] w-[14%] rotate-[18deg] bg-gradient-to-b from-slate-300 to-slate-500 opacity-80" />
                    </div>
                  </div>

                  <Card className="absolute top-4 left-4 w-[min(240px,calc(100%-2rem))] gap-3 py-4 shadow-xl">
                    <CardHeader className="px-4 pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base">Khesra #{selected.khesra}</CardTitle>
                        <AcquisitionBadge type={selected.acquisitionType} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 px-4 text-sm">
                      <MetaRow label="Khata" value={selected.khata || '—'} />
                      <MetaRow label="Rakba" value={formatDecimal(selected.rakbaDecimal)} />
                      <MetaRow
                        label="Status"
                        value={
                          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Recorded
                          </span>
                        }
                      />
                      <MetaRow label="Owner" value={selected.ownerName || 'Family'} />
                      <MetaRow label="Class" value={selected.landClass || '—'} />
                    </CardContent>
                  </Card>
                </div>

                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pb-2">
                    {plots.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedId(p.id)}
                        className={cn(
                          'inline-flex min-w-[200px] items-center gap-3 rounded-xl border bg-card px-3 py-2.5 text-left transition-all',
                          p.id === selected.id
                            ? 'border-primary/40 shadow-md shadow-primary/10'
                            : 'border-border hover:border-primary/30'
                        )}
                      >
                        <span
                          className={cn(
                            'size-10 shrink-0 rounded-lg',
                            p.acquisitionType === 'kewala' && 'bg-gradient-to-br from-orange-300 to-orange-700',
                            p.acquisitionType === 'rashid' && 'bg-gradient-to-br from-amber-300 to-amber-700',
                            p.acquisitionType === 'khatiyan' && 'bg-gradient-to-br from-emerald-300 to-emerald-800',
                            p.acquisitionType === 'other' && 'bg-gradient-to-br from-slate-300 to-slate-600'
                          )}
                        />
                        <span>
                          <span className="block text-sm font-bold">#{p.khesra}</span>
                          <span className="block text-xs text-muted-foreground">
                            {acquisitionLabels[p.acquisitionType]} · {formatDecimal(p.rakbaDecimal)}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </>
            ) : (
              <div className="grid min-h-[340px] m-auto h-full place-content-center gap-3 text-center">
                <LandPlot className='mx-auto size-10 text-muted-foreground'/>
                <p className="text-muted-foreground">No plots yet.</p>
                <Button asChild>
                  <Link to="/plots/new">Add your first khesra</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="gap-4 py-4">
            <CardHeader className="px-4 pb-0">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarFallback className="bg-foreground text-background font-bold">
                    {(selected?.ownerName || 'Z').slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{selected?.ownerName || 'Family holding'}</CardTitle>
                  <CardDescription>Thana {selected?.thanaNo || config.thanaNo}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4">
              {selected ? (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoCell label="Plot ID" value={`KHS-${selected.khesra}`} />
                    <InfoCell label="Khata" value={selected.khata || '—'} />
                    <InfoCell label="Jamabandi" value={selected.jamabandiNo || 'Pending'} />
                    <InfoCell
                      label="Acquisition"
                      value={acquisitionLabels[selected.acquisitionType]}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Khatiyan</span>
                      <span>Rashid</span>
                    </div>
                    <Progress
                      value={
                        selected.acquisitionType === 'khatiyan'
                          ? 33
                          : selected.acquisitionType === 'kewala'
                            ? 66
                            : 100
                      }
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Select a plot to inspect.</p>
              )}
            </CardContent>
            {selected && (
              <CardFooter className="grid grid-cols-2 gap-2 px-4">
                <Button asChild variant="outline">
                  <Link to={`/plots/${selected.id}/edit`}>Edit plot</Link>
                </Button>
                <Button asChild>
                  <Link to={`/plots/${selected.id}`}>Open details</Link>
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card className="gap-3 py-4">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-base">Area share</CardTitle>
              <CardDescription>This plot vs total portfolio rakba</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight">
                    {shareOfPortfolio}%
                  </div>
                  <p className="text-xs text-muted-foreground">of total rakba</p>
                </div>
                <Badge variant="secondary">{selected ? formatDecimal(selected.rakbaDecimal) : '—'}</Badge>
              </div>
              <Progress value={shareOfPortfolio} />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoCell
                  label="This plot"
                  value={selected ? formatDecimal(selected.rakbaDecimal) : '—'}
                />
                <InfoCell label="Portfolio" value={formatDecimal(stats.totalDecimal)} />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden gap-3 border-none bg-gradient-to-br from-sky-100 via-white to-lime-100 py-4">
            <Badge className="absolute top-3 right-3" variant="default">
              Geo ready
            </Badge>
            <CardHeader className="px-4 pb-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPinned className="size-4 text-primary" />
                Mauja map
              </CardTitle>
              <CardDescription>
                Cadastral overlay coming soon for Thana {config.thanaNo}.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <div className="relative h-20 overflow-hidden rounded-xl bg-gradient-to-b from-emerald-200 to-emerald-400">
                <div className="absolute top-[22%] left-[18%] h-[48%] w-[38%] rounded-md bg-primary/80 ring-2 ring-white/50" />
                <div className="absolute top-1/2 left-0 h-2 w-full -rotate-6 bg-slate-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-4 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-base">Acquisition mix</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 px-4">
            {acquisitionShare.map((a) => (
              <InfoCell
                key={a.key}
                label={a.label}
                value={`${a.count}/${stats.plotCount}`}
              />
            ))}
            <InfoCell
              label="Avg plot size"
              value={
                stats.plotCount
                  ? formatDecimal(stats.totalDecimal / stats.plotCount)
                  : '0 decimal'
              }
            />
          </CardContent>
        </Card>

        <Card className="gap-4 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-base">Portfolio balance</CardTitle>
            <CardDescription>Share of total rakba by provenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-4">
            {acquisitionShare.map((a) => {
              const width = Math.max(
                4,
                Math.round((a.totalDecimal / (stats.totalDecimal || 1)) * 100)
              )
              return (
                <div key={a.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{a.label}</span>
                    <span className="text-muted-foreground">{width}%</span>
                  </div>
                  <Progress value={width} />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="gap-4 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-primary" />
              Family & title
            </CardTitle>
            <CardDescription>Heirs and document strength for succession</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight">
                  {confidenceScore(stats)}%
                </div>
                <p className="text-xs text-muted-foreground">title confidence</p>
              </div>
              <Badge variant="secondary">{stats.familyMemberCount ?? 0} in tree</Badge>
            </div>
            <Separator />
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Kewala + Khatiyan preferred
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Link heirs to plots next
              </li>
            </ul>
            <Button asChild variant="outline" className="w-full">
              <Link to="/family">Open family tree</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  unit,
  hint,
  delta,
}: {
  label: string
  value: string
  unit: string
  hint: string
  delta: string
}) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4 pb-0">
        <CardDescription className="font-semibold">{label}</CardDescription>
        <CardTitle className="flex items-baseline gap-2 text-2xl tracking-tight">
          {value}
          <span className="text-xs font-medium text-muted-foreground">{unit}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2 px-4 text-xs">
        <span className="font-semibold text-emerald-600">{delta}</span>
        <span className="text-muted-foreground">{hint}</span>
      </CardContent>
    </Card>
  )
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[70px_1fr] gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  )
}

function pct(part: number, whole: number) {
  if (!whole) return 0
  return Math.round((part / whole) * 100)
}

function confidenceScore(stats: Stats) {
  if (!stats.plotCount) return 0
  const strong = stats.byAcquisition.khatiyan.count + stats.byAcquisition.kewala.count
  return Math.round((strong / stats.plotCount) * 100)
}
