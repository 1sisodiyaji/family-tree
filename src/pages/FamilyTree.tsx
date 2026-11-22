import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  Heart,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Users,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { api } from '@/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type {
  FamilyMember,
  FamilyMemberInput,
  FamilyTreeNode,
  FamilyTreePayload,
  Gender,
  RelationType,
} from '@/types'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 1.8

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

const emptyMember: FamilyMemberInput = {
  fullName: '',
  gender: '',
  birthYear: null,
  deathYear: null,
  isLiving: true,
  generationHint: null,
  phone: '',
  notes: '',
}

export function FamilyTreePage() {
  const [tree, setTree] = useState<FamilyTreePayload | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<FamilyMemberInput>(emptyMember)
  const [form, setForm] = useState<FamilyMemberInput>(emptyMember)
  const [childName, setChildName] = useState('')
  const [addingChild, setAddingChild] = useState(false)
  const [relPersonId, setRelPersonId] = useState('')
  const [relRelativeId, setRelRelativeId] = useState('')
  const [relType, setRelType] = useState<RelationType>('parent')
  const [zoom, setZoom] = useState(1)

  async function load(keepSelectedId?: number | null, opts?: { quiet?: boolean }) {
    if (!opts?.quiet) setLoading(true)
    try {
      const data = await api.getFamilyTree()
      setTree(data)
      setSelectedId((prev) => {
        if (keepSelectedId != null && data.members.some((m) => m.id === keepSelectedId)) {
          return keepSelectedId
        }
        return prev ?? data.members[0]?.id ?? null
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load family')
    } finally {
      if (!opts?.quiet) setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const membersById = useMemo(() => {
    const map = new Map<number, FamilyMember>()
    for (const m of tree?.members ?? []) map.set(m.id, m)
    return map
  }, [tree])

  const selected = selectedId != null ? membersById.get(selectedId) ?? null : null

  useEffect(() => {
    if (!selected) {
      setEditing(false)
      return
    }
    setEditForm({
      fullName: selected.fullName,
      gender: selected.gender,
      birthYear: selected.birthYear,
      deathYear: selected.deathYear,
      isLiving: selected.isLiving,
      generationHint: selected.generationHint,
      phone: selected.phone,
      notes: selected.notes,
    })
    setEditing(false)
    setRelPersonId(String(selected.id))
    setRelType('parent')
  }, [selected?.id])

  const selectedRelations = useMemo(() => {
    if (!tree || !selected) return []
    return tree.relationships.filter(
      (r) => r.personId === selected.id || r.relativeId === selected.id
    )
  }, [tree, selected])

  const children = useMemo(
    () =>
      selectedRelations.filter(
        (r) => r.relationType === 'parent' && r.personId === selected?.id
      ),
    [selectedRelations, selected]
  )
  const parents = useMemo(
    () =>
      selectedRelations.filter(
        (r) => r.relationType === 'parent' && r.relativeId === selected?.id
      ),
    [selectedRelations, selected]
  )
  const spouses = useMemo(
    () => selectedRelations.filter((r) => r.relationType === 'spouse'),
    [selectedRelations]
  )

  async function onCreateMember(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const created = await api.createFamilyMember(form)
      setForm(emptyMember)
      await load(created.id)
      setSelectedId(created.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add member')
    } finally {
      setSaving(false)
    }
  }

  async function onSaveEdit(e: FormEvent) {
    e.preventDefault()
    if (!selected) return
    setSaving(true)
    setError('')
    try {
      await api.updateFamilyMember(selected.id, editForm)
      setEditing(false)
      await load(selected.id, { quiet: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes')
    } finally {
      setSaving(false)
    }
  }

  async function onDeleteMember(id: number) {
    if (!confirm('Remove this family member and their relationships?')) return
    try {
      await api.deleteFamilyMember(id)
      setSelectedId(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  async function onAddChild(e: FormEvent) {
    e.preventDefault()
    if (!selected || !childName.trim()) return
    setAddingChild(true)
    setError('')
    try {
      const child = await api.createFamilyMember({
        ...emptyMember,
        fullName: childName.trim(),
      })
      await api.createRelationship({
        personId: selected.id,
        relativeId: child.id,
        relationType: 'parent',
      })
      setChildName('')
      await load(selected.id, { quiet: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add child')
    } finally {
      setAddingChild(false)
    }
  }

  async function onAddRelation(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!relPersonId || !relRelativeId) {
      setError('Select both people for the relationship')
      return
    }
    try {
      await api.createRelationship({
        personId: Number(relPersonId),
        relativeId: Number(relRelativeId),
        relationType: relType,
      })
      setRelRelativeId('')
      await load(selectedId, { quiet: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add relationship')
    }
  }

  async function onDeleteRelation(id: number) {
    try {
      await api.deleteRelationship(id)
      await load(selectedId, { quiet: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove relationship')
    }
  }

  function relationOtherId(rel: (typeof selectedRelations)[number], memberId: number) {
    return rel.personId === memberId ? rel.relativeId : rel.personId
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Family tree</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track ancestors, spouses, and heirs who hold or will inherit plots.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Users className="size-3.5" />
          {tree?.members.length ?? 0} members
        </Badge>
      </div>

      {error && (
        <Card className="border-destructive/40 py-4">
          <CardContent className="px-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-1">
        <Card className="overflow-hidden py-4">
          <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-2">
            <div>
              <CardTitle className="text-base">Vanshavali</CardTitle>
              <CardDescription>
                Pinch to zoom and drag to pan. Tap a person to edit.
              </CardDescription>
            </div>
            {tree && tree.tree.length > 0 && (
              <div className="flex items-center gap-1 rounded-full border bg-card p-1 shadow-sm">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setZoom((z) => clampZoom(Number((z - 0.1).toFixed(2))))}
                  aria-label="Zoom out"
                >
                  <ZoomOut />
                </Button>
                <span className="min-w-12 text-center text-xs font-semibold tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setZoom((z) => clampZoom(Number((z + 0.1).toFixed(2))))}
                  aria-label="Zoom in"
                >
                  <ZoomIn />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setZoom(1)}
                  aria-label="Reset zoom"
                >
                  <RotateCcw />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="px-4">
            {!tree || tree.tree.length === 0 ? (
              <div className="grid min-h-[280px] place-content-center text-center text-sm text-muted-foreground">
                No family tree yet. Add members and parent/spouse links.
              </div>
            ) : (
              <TreeViewport zoom={zoom} onZoomChange={setZoom}>
                {tree.tree.map((node) => (
                  <TreeBranch
                    key={node.memberId}
                    node={node}
                    membersById={membersById}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                ))}
              </TreeViewport>
            )}
          </CardContent>
        </Card>

        <div className="flex md:flex-row flex-col justify-between items-start gap-4">
          <Card className="gap-4 py-4 w-full h-full">
            <CardHeader className="flex flex-row items-center justify-between px-4 pb-0">
              <CardTitle className="text-base">Selected person</CardTitle>
              {selected && !editing && (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  <Pencil />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3 px-4">
              {selected ? (
                editing ? (
                  <form className="space-y-3" onSubmit={onSaveEdit}>
                    <div className="space-y-1.5">
                      <Label htmlFor="editFullName">Full name</Label>
                      <Input
                        id="editFullName"
                        required
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Gender</Label>
                        <Select
                          value={editForm.gender || 'unspecified'}
                          onValueChange={(value) =>
                            setEditForm({
                              ...editForm,
                              gender: (value === 'unspecified' ? '' : value) as Gender,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Unspecified" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unspecified">Unspecified</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="editBirthYear">Birth year</Label>
                        <Input
                          id="editBirthYear"
                          type="number"
                          value={editForm.birthYear ?? ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              birthYear: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="editDeathYear">Death year</Label>
                        <Input
                          id="editDeathYear"
                          type="number"
                          value={editForm.deathYear ?? ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              deathYear: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select
                          value={editForm.isLiving ? 'living' : 'deceased'}
                          onValueChange={(value) =>
                            setEditForm({ ...editForm, isLiving: value === 'living' })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="living">Living</SelectItem>
                            <SelectItem value="deceased">Deceased</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="editPhone">Phone</Label>
                      <Input
                        id="editPhone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="editNotes">Notes</Label>
                      <Textarea
                        id="editNotes"
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving} className="flex-1">
                        {saving ? 'Saving…' : 'Save changes'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditing(false)
                          setEditForm({
                            fullName: selected.fullName,
                            gender: selected.gender,
                            birthYear: selected.birthYear,
                            deathYear: selected.deathYear,
                            isLiving: selected.isLiving,
                            generationHint: selected.generationHint,
                            phone: selected.phone,
                            notes: selected.notes,
                          })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Avatar size="lg">
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {initials(selected.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{selected.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {selected.gender || 'unspecified'} ·{' '}
                          {selected.isLiving ? 'Living' : 'Deceased'}
                          {selected.birthYear ? ` · b. ${selected.birthYear}` : ''}
                          {selected.deathYear ? ` · d. ${selected.deathYear}` : ''}
                        </div>
                      </div>
                    </div>
                    {selected.phone && (
                      <p className="text-sm text-muted-foreground">Phone: {selected.phone}</p>
                    )}
                    {selected.notes && (
                      <p className="text-sm text-muted-foreground">{selected.notes}</p>
                    )}
                    <Separator />

                    <RelationGroup
                      title="Parents"
                      empty="No parents linked."
                      items={parents.map((rel) => ({
                        id: rel.id,
                        name:
                          membersById.get(relationOtherId(rel, selected.id))?.fullName ??
                          `#${relationOtherId(rel, selected.id)}`,
                        onSelect: () => setSelectedId(relationOtherId(rel, selected.id)),
                        onRemove: () => void onDeleteRelation(rel.id),
                      }))}
                    />

                    <RelationGroup
                      title={`Children (${children.length})`}
                      empty="No children yet — a person can have many."
                      items={children.map((rel) => ({
                        id: rel.id,
                        name:
                          membersById.get(relationOtherId(rel, selected.id))?.fullName ??
                          `#${relationOtherId(rel, selected.id)}`,
                        onSelect: () => setSelectedId(relationOtherId(rel, selected.id)),
                        onRemove: () => void onDeleteRelation(rel.id),
                      }))}
                    />

                    <form className="flex gap-2" onSubmit={onAddChild}>
                      <Input
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="Add another child…"
                        className="flex-1"
                      />
                      <Button type="submit" size="sm" disabled={addingChild || !childName.trim()}>
                        <Plus />
                        Child
                      </Button>
                    </form>

                    <RelationGroup
                      title="Spouses"
                      empty="No spouse linked."
                      items={spouses.map((rel) => ({
                        id: rel.id,
                        name:
                          membersById.get(relationOtherId(rel, selected.id))?.fullName ??
                          `#${relationOtherId(rel, selected.id)}`,
                        onSelect: () => setSelectedId(relationOtherId(rel, selected.id)),
                        onRemove: () => void onDeleteRelation(rel.id),
                      }))}
                    />

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => void onDeleteMember(selected.id)}
                    >
                      <Trash2 />
                      Remove member
                    </Button>
                  </>
                )
              ) : (
                <p className="text-sm text-muted-foreground">Select someone from the tree.</p>
              )}
            </CardContent>
          </Card>

          <Card className="gap-4 py-4 w-full h-full">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-base">Add member</CardTitle>
              <CardDescription>Start with name; connect parents/spouses next.</CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <form className="space-y-3" onSubmit={onCreateMember}>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={form.gender || 'unspecified'}
                      onValueChange={(value) =>
                        setForm({
                          ...form,
                          gender: (value === 'unspecified' ? '' : value) as Gender,
                        })
                      }
                    >
                      <SelectTrigger id="gender" className="w-full">
                        <SelectValue placeholder="Unspecified" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unspecified">Unspecified</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="birthYear">Birth year</Label>
                    <Input
                      id="birthYear"
                      type="number"
                      value={form.birthYear ?? ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          birthYear: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Role in land holding, mutation notes…"
                  />
                </div>
                <Button type="submit" disabled={saving} className="w-full">
                  <Plus />
                  {saving ? 'Saving…' : 'Add to family'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-4 py-4 w-full h-full">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="size-4 text-primary" />
                Link relationship
              </CardTitle>
              <CardDescription>
                Use “is parent of” once per child — one person can have many children. Spouse
                links both ways.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <form className="space-y-3" onSubmit={onAddRelation}>
                <div className="space-y-1.5">
                  <Label htmlFor="personId">Person</Label>
                  <Select value={relPersonId || undefined} onValueChange={setRelPersonId}>
                    <SelectTrigger id="personId" className="w-full">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(tree?.members ?? []).map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="relType">Relation</Label>
                  <Select
                    value={relType}
                    onValueChange={(value) => setRelType(value as RelationType)}
                  >
                    <SelectTrigger id="relType" className="w-full">
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">is parent of</SelectItem>
                      <SelectItem value="spouse">is spouse of</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="relativeId">Relative</Label>
                  <Select value={relRelativeId || undefined} onValueChange={setRelRelativeId}>
                    <SelectTrigger id="relativeId" className="w-full">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {(tree?.members ?? []).map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" variant="outline" className="w-full">
                  Save relationship
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function RelationGroup({
  title,
  empty,
  items,
}: {
  title: string
  empty: string
  items: Array<{
    id: number
    name: string
    onSelect: () => void
    onRemove: () => void
  }>
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
          >
            <button
              type="button"
              className="text-left font-semibold hover:text-primary"
              onClick={item.onSelect}
            >
              {item.name}
            </button>
            <Button size="icon-sm" variant="ghost" onClick={item.onRemove}>
              <Trash2 />
            </Button>
          </div>
        ))
      )}
    </div>
  )
}

type PinchGesture = {
  distance: number
  zoom: number
  pan: { x: number; y: number }
  mid: { x: number; y: number }
}

function TreeViewport({
  zoom,
  onZoomChange,
  children,
}: {
  zoom: number
  onZoomChange: (zoom: number) => void
  children: ReactNode
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [gesturing, setGesturing] = useState(false)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchRef = useRef<PinchGesture | null>(null)
  const zoomRef = useRef(zoom)
  const panRef = useRef(pan)
  const onZoomChangeRef = useRef(onZoomChange)

  zoomRef.current = zoom
  panRef.current = pan
  onZoomChangeRef.current = onZoomChange

  useEffect(() => {
    const el = viewportRef.current
    const canvas = canvasRef.current
    if (!el || !canvas) return

    function touchDistance(touches: TouchList) {
      const a = touches[0]
      const b = touches[1]
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
    }

    function touchMidpoint(touches: TouchList) {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
      }
    }

    function layoutCenter() {
      const viewportRect = el!.getBoundingClientRect()
      const style = getComputedStyle(el!)
      const borderLeft = Number.parseFloat(style.borderLeftWidth) || 0
      const borderTop = Number.parseFloat(style.borderTopWidth) || 0
      return {
        x: viewportRect.left + borderLeft + canvas!.offsetLeft + canvas!.offsetWidth / 2,
        y: viewportRect.top + borderTop + canvas!.offsetTop + canvas!.offsetHeight / 2,
      }
    }

    function beginPinch(touches: TouchList) {
      dragging.current = false
      pinchRef.current = {
        distance: touchDistance(touches),
        zoom: zoomRef.current,
        pan: { ...panRef.current },
        mid: touchMidpoint(touches),
      }
      setGesturing(true)
    }

    function applyPinch(touches: TouchList) {
      const start = pinchRef.current
      if (!start || start.distance <= 0) return
      const distance = touchDistance(touches)
      const midpoint = touchMidpoint(touches)
      const nextZoom = clampZoom(start.zoom * (distance / start.distance))
      const ratio = start.zoom === 0 ? 1 : nextZoom / start.zoom
      const center = layoutCenter()
      const nextPan = {
        x:
          (start.mid.x - center.x) * (1 - ratio) +
          start.pan.x * ratio +
          (midpoint.x - start.mid.x),
        y:
          (start.mid.y - center.y) * (1 - ratio) +
          start.pan.y * ratio +
          (midpoint.y - start.mid.y),
      }
      panRef.current = nextPan
      setPan(nextPan)
      onZoomChangeRef.current(nextZoom)
    }

    function onTouchStart(event: TouchEvent) {
      if (event.touches.length === 2) {
        event.preventDefault()
        beginPinch(event.touches)
      }
    }

    function onTouchMove(event: TouchEvent) {
      if (event.touches.length >= 2 && pinchRef.current) {
        event.preventDefault()
        applyPinch(event.touches)
      }
    }

    function onTouchEnd(event: TouchEvent) {
      if (event.touches.length >= 2) {
        beginPinch(event.touches)
        return
      }
      pinchRef.current = null
      setGesturing(false)
      if (event.touches.length === 1) {
        dragging.current = true
        last.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
      }
    }

    function onWheel(event: WheelEvent) {
      if (!(event.ctrlKey || event.metaKey)) return
      event.preventDefault()
      const step = event.deltaY > 0 ? -0.08 : 0.08
      onZoomChangeRef.current(clampZoom(zoomRef.current + step))
    }

    function onGesture(event: Event) {
      event.preventDefault()
    }

    function onPointerDownCapture(event: PointerEvent) {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (pointers.current.size >= 2) dragging.current = false
    }

    function onPointerUpCapture(event: PointerEvent) {
      pointers.current.delete(event.pointerId)
    }

    const touchOpts = { passive: false, capture: true } as const
    el.addEventListener('touchstart', onTouchStart, touchOpts)
    el.addEventListener('touchmove', onTouchMove, touchOpts)
    el.addEventListener('touchend', onTouchEnd, touchOpts)
    el.addEventListener('touchcancel', onTouchEnd, touchOpts)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('gesturestart', onGesture, { passive: false })
    el.addEventListener('gesturechange', onGesture, { passive: false })
    el.addEventListener('pointerdown', onPointerDownCapture, true)
    el.addEventListener('pointerup', onPointerUpCapture, true)
    el.addEventListener('pointercancel', onPointerUpCapture, true)

    return () => {
      el.removeEventListener('touchstart', onTouchStart, touchOpts)
      el.removeEventListener('touchmove', onTouchMove, touchOpts)
      el.removeEventListener('touchend', onTouchEnd, touchOpts)
      el.removeEventListener('touchcancel', onTouchEnd, touchOpts)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('gesturestart', onGesture)
      el.removeEventListener('gesturechange', onGesture)
      el.removeEventListener('pointerdown', onPointerDownCapture, true)
      el.removeEventListener('pointerup', onPointerUpCapture, true)
      el.removeEventListener('pointercancel', onPointerUpCapture, true)
    }
  }, [])

  return (
    <div
      ref={viewportRef}
      className="tree-viewport relative h-[min(70vh,640px)] overflow-hidden rounded-2xl border"
      onPointerDown={(e) => {
        if (e.button !== 0) return
        if (pointers.current.size >= 2 || pinchRef.current) {
          dragging.current = false
          return
        }
        dragging.current = true
        last.current = { x: e.clientX, y: e.clientY }
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (pinchRef.current || pointers.current.size >= 2) return
        if (!dragging.current) return
        const dx = e.clientX - last.current.x
        const dy = e.clientY - last.current.y
        last.current = { x: e.clientX, y: e.clientY }
        const next = { x: panRef.current.x + dx, y: panRef.current.y + dy }
        panRef.current = next
        setPan(next)
      }}
      onPointerUp={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId)
        }
        const remaining = [...pointers.current.values()]
        dragging.current = remaining.length === 1
        if (remaining.length === 1) last.current = { ...remaining[0] }
      }}
      onPointerCancel={() => {
        dragging.current = false
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-2">
        <span className="max-w-[calc(100%-1rem)] rounded-full border bg-card/90 px-3 py-1 text-center text-[11px] font-medium leading-snug text-muted-foreground shadow-sm backdrop-blur">
          Drag to pan · Pinch or Ctrl/⌘ + scroll to zoom
        </span>
      </div>
      <div
        ref={canvasRef}
        className="tree-canvas flex min-h-full min-w-full origin-center items-start justify-center p-10 pt-14"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: gesturing ? 'none' : undefined,
        }}
      >
        <div className="flex flex-col items-center gap-10">{children}</div>
      </div>
    </div>
  )
}

function TreeBranch({
  node,
  membersById,
  selectedId,
  onSelect,
}: {
  node: FamilyTreeNode
  membersById: Map<number, FamilyMember>
  selectedId: number | null
  onSelect: (id: number) => void
}) {
  const member = membersById.get(node.memberId)
  if (!member) return null
  const spouses = node.spouseIds
    .map((id) => membersById.get(id))
    .filter(Boolean) as FamilyMember[]
  const hasChildren = node.children.length > 0

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center gap-2">
        <PersonChip
          member={member}
          selected={selectedId === member.id}
          onSelect={() => onSelect(member.id)}
        />
        {spouses.map((spouse) => (
          <div key={spouse.id} className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full border border-primary/20 bg-pink-400 dark:bg-pink-700 text-xs text-white shadow-sm">
              ♥
            </span>
            <PersonChip
              member={spouse}
              selected={selectedId === spouse.id}
              onSelect={() => onSelect(spouse.id)}
            />
          </div>
        ))}
      </div>

      {hasChildren && (
        <>
          <div className="tree-stem" />
          <div className="flex items-start justify-center">
            {node.children.map((child, index) => (
              <div
                key={child.memberId}
                className={cn(
                  'relative flex flex-col items-center px-4',
                  node.children.length > 1 && 'tree-child'
                )}
              >
                {node.children.length > 1 && (
                  <div
                    className={cn(
                      'tree-elbow',
                      index === 0 && 'first',
                      index === node.children.length - 1 && 'last'
                    )}
                  />
                )}
                <div className="tree-stem short" />
                <TreeBranch
                  node={child}
                  membersById={membersById}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function PersonChip({
  member,
  selected,
  onSelect,
}: {
  member: FamilyMember
  selected: boolean
  onSelect: () => void
}) {
  const tone =
    member.gender === 'female'
      ? 'from-rose-50 to-gray-100 border-rose-200/80'
      : member.gender === 'male'
        ? 'from-sky-50 to-emerald-50 border-sky-200/80'
        : 'from-slate-50 to-amber-50 border-slate-200/80'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        'group relative w-fit-content min-w-[200px] rounded-2xl border bg-gradient-to-br p-3 text-left shadow-sm transition-all',
        tone,
        !member.isLiving && 'opacity-80',
        selected
          ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/25'
          : 'hover:-translate-y-0.5 hover:shadow-md'
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar size="default">
          <AvatarFallback
            className={cn(
              'text-xs font-bold',
              member.gender === 'female' && 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
              member.gender === 'male' && 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200',
              !member.gender && 'bg-muted text-muted-foreground'
            )}
          >
            {initials(member.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold tracking-tight text-black">{member.fullName}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground dark:text-gray-400">
            <span>
              {member.birthYear ?? '—'}
              {member.deathYear ? `–${member.deathYear}` : ''}
            </span>
            {!member.isLiving && (
              <span className="rounded-full bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white dark:text-gray-400">
                Deceased
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}
