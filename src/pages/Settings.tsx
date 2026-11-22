import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Download, RotateCcw, Upload } from 'lucide-react'
import { api } from '@/api'
import { exportDatabaseFile, importDatabaseFile, store } from '@/data/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { MaujaConfig } from '@/types'

export function Settings() {
  const [form, setForm] = useState<MaujaConfig>({
    district: '',
    anchal: '',
    halka: '',
    maujaName: '',
    thanaNo: '113',
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api
      .getConfig()
      .then(setForm)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const updated = await api.updateConfig(form)
      setForm(updated)
      setMessage('Settings saved locally.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  async function onImport(file: File | null) {
    if (!file) return
    setError('')
    setMessage('')
    try {
      await importDatabaseFile(file)
      const config = await api.getConfig()
      setForm(config)
      setMessage(`Imported ${file.name}. Reload pages to see updated data.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    }
  }

  function onReset() {
    if (!confirm('Reset all data to the constants.ts seed? Local changes will be lost.')) return
    store.resetToConstants()
    const config = store.getConfig()
    setForm(config)
    setMessage('Reset to seed data from constants.ts.')
    setError('')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Frontend-only mode: data lives in the browser (seeded from constants.ts). Export or import
          a JSON file anytime.
        </p>
      </div>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-base">Mauja context</CardTitle>
          <CardDescription>Applied across the family land portfolio</CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">District</label>
              <Input
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Anchal (circle)</label>
              <Input
                value={form.anchal}
                onChange={(e) => setForm({ ...form, anchal: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Halka</label>
              <Input
                value={form.halka}
                onChange={(e) => setForm({ ...form, halka: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Mauja name</label>
              <Input
                value={form.maujaName}
                onChange={(e) => setForm({ ...form, maujaName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Thana no.</label>
              <Input
                value={form.thanaNo}
                onChange={(e) => setForm({ ...form, thanaNo: e.target.value })}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Revenue village identifier used with every khesra.
              </p>
            </div>

            {error && <p className="md:col-span-2 text-sm text-destructive">{error}</p>}
            {message && (
              <p className="md:col-span-2 text-sm text-muted-foreground">{message}</p>
            )}

            <div className="md:col-span-2">
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-base">Data file operations</CardTitle>
          <CardDescription>
            Seed lives in <code className="text-xs">src/data/constants.ts</code>. Runtime edits are
            kept in localStorage. Use JSON export/import to back up or move data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 px-4">
          <Button type="button" variant="outline" onClick={() => exportDatabaseFile()}>
            <Download />
            Export JSON
          </Button>
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload />
            Import JSON
          </Button>
          <Button type="button" variant="destructive" onClick={onReset}>
            <RotateCcw />
            Reset to constants
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              void onImport(e.target.files?.[0] ?? null)
              e.target.value = ''
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
