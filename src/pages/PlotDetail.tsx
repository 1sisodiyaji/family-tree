import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { docTypeLabels, formatAcre, formatDecimal } from '@/labels'
import type { DocType, Plot } from '@/types'

export function PlotDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plot, setPlot] = useState<Plot | null>(null)
  const [error, setError] = useState('')
  const [docType, setDocType] = useState<DocType>('kewala')
  const [referenceNo, setReferenceNo] = useState('')
  const [docDate, setDocDate] = useState('')
  const [remarks, setRemarks] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function load() {
    if (!id) return
    const p = await api.getPlot(Number(id))
    setPlot(p)
  }

  useEffect(() => {
    load().catch((e: Error) => setError(e.message))
  }, [id])

  async function onDelete() {
    if (!plot || !confirm(`Delete khesra ${plot.khesra}?`)) return
    try {
      await api.deletePlot(plot.id)
      navigate('/plots')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  async function onUpload(e: FormEvent) {
    e.preventDefault()
    if (!plot) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('docType', docType)
      fd.append('referenceNo', referenceNo)
      fd.append('docDate', docDate)
      fd.append('remarks', remarks)
      if (file) fd.append('file', file)
      await api.uploadDocument(plot.id, fd)
      setReferenceNo('')
      setDocDate('')
      setRemarks('')
      setFile(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function onDeleteDoc(docId: number) {
    if (!confirm('Delete this document?')) return
    try {
      await api.deleteDocument(docId)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  if (error && !plot) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!plot) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Khesra {plot.khesra}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Thana {plot.thanaNo}</span>
            <span>·</span>
            <span>Khata {plot.khata || '—'}</span>
            <AcquisitionBadge type={plot.acquisitionType} />
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/plots/${plot.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="destructive" type="button" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="gap-4 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-base">Plot details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4">
            <dl className="grid gap-2 text-sm sm:grid-cols-[140px_1fr]">
              <dt className="text-muted-foreground">Rakba</dt>
              <dd className="font-semibold">
                {formatDecimal(plot.rakbaDecimal)} ({formatAcre(plot.rakbaAcre)})
              </dd>
              <dt className="text-muted-foreground">Share</dt>
              <dd className="font-semibold">
                {plot.shareDecimal == null ? '—' : formatDecimal(plot.shareDecimal)}
              </dd>
              <dt className="text-muted-foreground">Jamabandi</dt>
              <dd className="font-semibold">{plot.jamabandiNo || '—'}</dd>
              <dt className="text-muted-foreground">Owner</dt>
              <dd className="font-semibold">{plot.ownerName || '—'}</dd>
              <dt className="text-muted-foreground">Land class</dt>
              <dd className="font-semibold">{plot.landClass || '—'}</dd>
              <dt className="text-muted-foreground">Notes</dt>
              <dd className="font-semibold">{plot.notes || '—'}</dd>
            </dl>
            <Separator />
            <div>
              <h2 className="mb-3 text-base font-semibold">Chauhaddi</h2>
              <dl className="grid gap-2 text-sm sm:grid-cols-[140px_1fr]">
                <dt className="text-muted-foreground">North</dt>
                <dd className="font-semibold">{plot.chauhaddi.north || '—'}</dd>
                <dt className="text-muted-foreground">South</dt>
                <dd className="font-semibold">{plot.chauhaddi.south || '—'}</dd>
                <dt className="text-muted-foreground">East</dt>
                <dd className="font-semibold">{plot.chauhaddi.east || '—'}</dd>
                <dt className="text-muted-foreground">West</dt>
                <dd className="font-semibold">{plot.chauhaddi.west || '—'}</dd>
              </dl>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-3 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-base">Map</CardTitle>
            <CardDescription>Geolocation coming soon</CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <div className="grid min-h-44 place-items-center rounded-xl border border-dashed bg-gradient-to-b from-sky-50 to-amber-50 p-6 text-center text-sm text-muted-foreground">
              Geo fields are reserved on this plot for future map overlay.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-4 py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4">
          <div className="space-y-3">
            {(plot.documents ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No documents attached yet.</p>
            )}
            {(plot.documents ?? []).map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-3"
              >
                <div>
                  <div className="font-semibold">{docTypeLabels[d.docType]}</div>
                  <div className="text-sm text-muted-foreground">
                    {d.referenceNo || 'No reference'}
                    {d.docDate ? ` · ${d.docDate}` : ''}
                  </div>
                  {d.remarks && <div className="text-sm">{d.remarks}</div>}
                  {d.filePath && (
                    <a
                      className="text-sm font-medium text-primary hover:underline"
                      href={d.filePath}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {d.originalName || 'Open file'}
                    </a>
                  )}
                </div>
                <Button type="button" variant="outline" onClick={() => onDeleteDoc(d.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          <form className="grid gap-4 md:grid-cols-2" onSubmit={onUpload}>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Document type</label>
              <Select value={docType} onValueChange={(value) => setDocType(value as DocType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="khatiyan">Khatiyan</SelectItem>
                  <SelectItem value="kewala">Kewala</SelectItem>
                  <SelectItem value="rashid">Lagaan Rashid</SelectItem>
                  <SelectItem value="jamabandi">Jamabandi</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Reference no.</label>
              <Input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Date</label>
              <Input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">File (PDF / image)</label>
              <Input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">Remarks</label>
              <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading…' : 'Attach document'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
