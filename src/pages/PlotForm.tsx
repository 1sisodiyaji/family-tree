import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api'
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
import { acquisitionHelp } from '@/labels'
import type { AcquisitionType, PlotInput } from '@/types'

const empty: PlotInput = {
  khesra: '',
  khata: '',
  jamabandiNo: '',
  rakbaDecimal: 0,
  shareDecimal: null,
  chauhaddiNorth: '',
  chauhaddiSouth: '',
  chauhaddiEast: '',
  chauhaddiWest: '',
  landClass: '',
  acquisitionType: 'khatiyan',
  ownerName: '',
  notes: '',
}

export function PlotForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<PlotInput>(empty)
  const [shareText, setShareText] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!id) return
    api
      .getPlot(Number(id))
      .then((p) => {
        setForm({
          khesra: p.khesra,
          khata: p.khata,
          jamabandiNo: p.jamabandiNo,
          rakbaDecimal: p.rakbaDecimal,
          shareDecimal: p.shareDecimal,
          chauhaddiNorth: p.chauhaddi.north,
          chauhaddiSouth: p.chauhaddi.south,
          chauhaddiEast: p.chauhaddi.east,
          chauhaddiWest: p.chauhaddi.west,
          landClass: p.landClass,
          acquisitionType: p.acquisitionType,
          ownerName: p.ownerName,
          notes: p.notes,
        })
        setShareText(p.shareDecimal == null ? '' : String(p.shareDecimal))
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function set<K extends keyof PlotInput>(key: K, value: PlotInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload: PlotInput = {
      ...form,
      shareDecimal: shareText.trim() === '' ? null : Number(shareText),
      rakbaDecimal: Number(form.rakbaDecimal),
    }
    try {
      if (isEdit) {
        await api.updatePlot(Number(id), payload)
        navigate(`/plots/${id}`)
      } else {
        const created = await api.createPlot(payload)
        navigate(`/plots/${created.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit plot' : 'Add plot'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Record khesra, khata, rakba in decimal, chauhaddi, and acquisition type.
        </p>
      </div>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-base">Plot record</CardTitle>
          <CardDescription>Bihar revenue fields for Thana portfolio</CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <Field label="Khesra (plot no.)">
              <Input required value={form.khesra} onChange={(e) => set('khesra', e.target.value)} />
            </Field>
            <Field label="Khata">
              <Input value={form.khata} onChange={(e) => set('khata', e.target.value)} />
            </Field>
            <Field label="Jamabandi no.">
              <Input
                value={form.jamabandiNo}
                onChange={(e) => set('jamabandiNo', e.target.value)}
              />
            </Field>
            <Field label="Rakba (decimal)" hint="1 decimal = 0.01 acre ≈ 435.6 sq ft">
              <Input
                type="number"
                min="0"
                step="0.001"
                required
                value={form.rakbaDecimal}
                onChange={(e) => set('rakbaDecimal', Number(e.target.value))}
              />
            </Field>
            <Field label="Share (decimal, optional)">
              <Input
                type="number"
                min="0"
                step="0.001"
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                placeholder="If holding is a share of full khesra"
              />
            </Field>
            <Field label="Acquisition type" hint={acquisitionHelp[form.acquisitionType]}>
              <Select
                value={form.acquisitionType}
                onValueChange={(value) => set('acquisitionType', value as AcquisitionType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select acquisition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="khatiyan">Khatiyan (ancestral)</SelectItem>
                  <SelectItem value="kewala">Kewala (purchased)</SelectItem>
                  <SelectItem value="rashid">Rashid (revenue receipt)</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Owner / family name">
              <Input value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} />
            </Field>
            <Field label="Land class">
              <Input
                placeholder="agri / basgit / …"
                value={form.landClass}
                onChange={(e) => set('landClass', e.target.value)}
              />
            </Field>
            <Field label="Chauhaddi — North">
              <Input
                value={form.chauhaddiNorth}
                onChange={(e) => set('chauhaddiNorth', e.target.value)}
              />
            </Field>
            <Field label="Chauhaddi — South">
              <Input
                value={form.chauhaddiSouth}
                onChange={(e) => set('chauhaddiSouth', e.target.value)}
              />
            </Field>
            <Field label="Chauhaddi — East">
              <Input
                value={form.chauhaddiEast}
                onChange={(e) => set('chauhaddiEast', e.target.value)}
              />
            </Field>
            <Field label="Chauhaddi — West">
              <Input
                value={form.chauhaddiWest}
                onChange={(e) => set('chauhaddiWest', e.target.value)}
              />
            </Field>
            <Field label="Notes" className="md:col-span-2">
              <textarea
                className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </Field>

            {error && <p className="md:col-span-2 text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create plot'}
              </Button>
              <Button asChild type="button" variant="outline">
                <Link to={isEdit ? `/plots/${id}` : '/plots'}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
