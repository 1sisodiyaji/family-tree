import {
  createInitialDatabase,
  STORAGE_KEY,
  type AppDatabase,
} from '@/data/constants'
import type {
  Document,
  DocType,
  FamilyMember,
  FamilyMemberInput,
  FamilyRelationship,
  FamilyTreeNode,
  FamilyTreePayload,
  MaujaConfig,
  OwnerRole,
  Plot,
  PlotInput,
  PlotOwnerLink,
  RelationType,
  Stats,
} from '@/types'

function nowIso() {
  return new Date().toISOString()
}

function cloneDb(db: AppDatabase): AppDatabase {
  return structuredClone(db)
}

function loadDb(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = createInitialDatabase()
      saveDb(initial)
      return initial
    }
    return JSON.parse(raw) as AppDatabase
  } catch {
    const initial = createInitialDatabase()
    saveDb(initial)
    return initial
  }
}

function saveDb(db: AppDatabase) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

let db = loadDb()

function commit(next: AppDatabase) {
  db = next
  saveDb(db)
  return db
}

function withPlotAcre(plot: Omit<Plot, 'rakbaAcre' | 'documents'> & { rakbaAcre?: number }): Plot {
  return {
    ...plot,
    rakbaAcre: Number((plot.rakbaDecimal / 100).toFixed(4)),
  }
}

function buildTree(members: FamilyMember[], relationships: FamilyRelationship[]): FamilyTreePayload {
  const childrenOf = new Map<number, number[]>()
  const parentsOf = new Map<number, number[]>()
  const spousesOf = new Map<number, number[]>()

  for (const rel of relationships) {
    if (rel.relationType === 'parent') {
      const kids = childrenOf.get(rel.personId) ?? []
      kids.push(rel.relativeId)
      childrenOf.set(rel.personId, kids)
      const parents = parentsOf.get(rel.relativeId) ?? []
      parents.push(rel.personId)
      parentsOf.set(rel.relativeId, parents)
    } else {
      const a = spousesOf.get(rel.personId) ?? []
      a.push(rel.relativeId)
      spousesOf.set(rel.personId, a)
      const b = spousesOf.get(rel.relativeId) ?? []
      b.push(rel.personId)
      spousesOf.set(rel.relativeId, b)
    }
  }

  const memberIds = new Set(members.map((m) => m.id))
  const roots = members.filter((m) => {
    const parents = (parentsOf.get(m.id) ?? []).filter((p) => memberIds.has(p))
    if (parents.length > 0) return false
    const spouses = (spousesOf.get(m.id) ?? []).filter((s) => memberIds.has(s))
    if (spouses.some((sid) => (parentsOf.get(sid) ?? []).some((p) => memberIds.has(p)))) {
      return false
    }
    if (
      spouses.some((sid) => {
        const spouseParents = (parentsOf.get(sid) ?? []).filter((p) => memberIds.has(p))
        return spouseParents.length === 0 && sid < m.id
      })
    ) {
      return false
    }
    return true
  })

  const visiting = new Set<number>()
  function nodeFor(id: number): FamilyTreeNode | null {
    if (visiting.has(id)) return null
    visiting.add(id)
    const children = (childrenOf.get(id) ?? [])
      .map((childId) => nodeFor(childId))
      .filter(Boolean) as FamilyTreeNode[]
    visiting.delete(id)
    return {
      memberId: id,
      spouseIds: [...new Set(spousesOf.get(id) ?? [])],
      children,
    }
  }

  return {
    members,
    relationships,
    roots: roots.map((r) => r.id),
    tree: roots.map((r) => nodeFor(r.id)).filter(Boolean) as FamilyTreeNode[],
  }
}

export const store = {
  getSnapshot(): AppDatabase {
    return cloneDb(db)
  },

  resetToConstants() {
    return commit(createInitialDatabase())
  },

  importDatabase(payload: AppDatabase) {
    if (!payload?.config || !Array.isArray(payload.plots)) {
      throw new Error('Invalid Zameen data file')
    }
    return commit(cloneDb(payload))
  },

  getConfig(): MaujaConfig {
    return { ...db.config }
  },

  updateConfig(body: Partial<MaujaConfig>): MaujaConfig {
    const next = cloneDb(db)
    next.config = {
      ...next.config,
      ...body,
      updatedAt: nowIso(),
    }
    commit(next)
    return { ...next.config }
  },

  getStats(): Stats {
    const plots = db.plots
    const byAcquisition: Stats['byAcquisition'] = {
      khatiyan: { count: 0, totalDecimal: 0 },
      kewala: { count: 0, totalDecimal: 0 },
      rashid: { count: 0, totalDecimal: 0 },
      other: { count: 0, totalDecimal: 0 },
    }
    let totalDecimal = 0
    for (const p of plots) {
      totalDecimal += p.rakbaDecimal
      const bucket = byAcquisition[p.acquisitionType] ?? byAcquisition.other
      bucket.count += 1
      bucket.totalDecimal += p.rakbaDecimal
    }
    const recent = [...plots]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        khesra: p.khesra,
        khata: p.khata,
        rakbaDecimal: p.rakbaDecimal,
        acquisitionType: p.acquisitionType,
        ownerName: p.ownerName,
        updatedAt: p.updatedAt,
      }))

    return {
      plotCount: plots.length,
      totalDecimal,
      totalAcre: Number((totalDecimal / 100).toFixed(4)),
      familyMemberCount: db.familyMembers.length,
      livingMemberCount: db.familyMembers.filter((m) => m.isLiving).length,
      byAcquisition,
      recent,
    }
  },

  getPlots(params?: { acquisitionType?: string; q?: string }): Plot[] {
    let rows = [...db.plots]
    if (params?.acquisitionType) {
      rows = rows.filter((p) => p.acquisitionType === params.acquisitionType)
    }
    if (params?.q?.trim()) {
      const q = params.q.trim().toLowerCase()
      rows = rows.filter(
        (p) =>
          p.khesra.toLowerCase().includes(q) ||
          p.khata.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.jamabandiNo.toLowerCase().includes(q)
      )
    }
    return rows.sort((a, b) => Number(a.khesra) - Number(b.khesra) || a.khesra.localeCompare(b.khesra))
  },

  getPlot(id: number): Plot {
    const plot = db.plots.find((p) => p.id === id)
    if (!plot) throw new Error('Plot not found')
    const documents = db.documents
      .filter((d) => d.plotId === id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return { ...plot, documents }
  },

  createPlot(body: PlotInput): Plot {
    if (!body.khesra?.trim()) throw new Error('khesra is required')
    const thanaNo = db.config.thanaNo || '113'
    if (db.plots.some((p) => p.thanaNo === thanaNo && p.khesra === body.khesra.trim())) {
      throw new Error(`Khesra ${body.khesra} already exists in thana ${thanaNo}`)
    }
    const next = cloneDb(db)
    const stamp = nowIso()
    const plot = withPlotAcre({
      id: next.nextIds.plot++,
      khesra: body.khesra.trim(),
      khata: body.khata?.trim() ?? '',
      jamabandiNo: body.jamabandiNo?.trim() ?? '',
      rakbaDecimal: Number(body.rakbaDecimal) || 0,
      shareDecimal: body.shareDecimal ?? null,
      chauhaddi: {
        north: body.chauhaddiNorth?.trim() ?? '',
        south: body.chauhaddiSouth?.trim() ?? '',
        east: body.chauhaddiEast?.trim() ?? '',
        west: body.chauhaddiWest?.trim() ?? '',
      },
      landClass: body.landClass?.trim() ?? '',
      acquisitionType: body.acquisitionType,
      ownerName: body.ownerName?.trim() ?? '',
      notes: body.notes?.trim() ?? '',
      geo: null,
      thanaNo,
      createdAt: stamp,
      updatedAt: stamp,
    })
    next.plots.push(plot)
    commit(next)
    return { ...plot, documents: [] }
  },

  updatePlot(id: number, body: Partial<PlotInput>): Plot {
    const next = cloneDb(db)
    const idx = next.plots.findIndex((p) => p.id === id)
    if (idx < 0) throw new Error('Plot not found')
    const existing = next.plots[idx]
    const khesra = body.khesra?.trim() ?? existing.khesra
    if (
      next.plots.some(
        (p) => p.id !== id && p.thanaNo === existing.thanaNo && p.khesra === khesra
      )
    ) {
      throw new Error('Khesra already exists for this thana')
    }
    const updated = withPlotAcre({
      ...existing,
      khesra,
      khata: body.khata !== undefined ? body.khata.trim() : existing.khata,
      jamabandiNo:
        body.jamabandiNo !== undefined ? body.jamabandiNo.trim() : existing.jamabandiNo,
      rakbaDecimal: body.rakbaDecimal ?? existing.rakbaDecimal,
      shareDecimal: body.shareDecimal !== undefined ? body.shareDecimal : existing.shareDecimal,
      chauhaddi: {
        north:
          body.chauhaddiNorth !== undefined
            ? body.chauhaddiNorth.trim()
            : existing.chauhaddi.north,
        south:
          body.chauhaddiSouth !== undefined
            ? body.chauhaddiSouth.trim()
            : existing.chauhaddi.south,
        east:
          body.chauhaddiEast !== undefined ? body.chauhaddiEast.trim() : existing.chauhaddi.east,
        west:
          body.chauhaddiWest !== undefined ? body.chauhaddiWest.trim() : existing.chauhaddi.west,
      },
      landClass: body.landClass !== undefined ? body.landClass.trim() : existing.landClass,
      acquisitionType: body.acquisitionType ?? existing.acquisitionType,
      ownerName: body.ownerName !== undefined ? body.ownerName.trim() : existing.ownerName,
      notes: body.notes !== undefined ? body.notes.trim() : existing.notes,
      updatedAt: nowIso(),
    })
    next.plots[idx] = updated
    commit(next)
    return this.getPlot(id)
  },

  deletePlot(id: number) {
    const next = cloneDb(db)
    if (!next.plots.some((p) => p.id === id)) throw new Error('Plot not found')
    next.plots = next.plots.filter((p) => p.id !== id)
    next.documents = next.documents.filter((d) => d.plotId !== id)
    next.plotOwners = next.plotOwners.filter((o) => o.plotId !== id)
    commit(next)
  },

  async uploadDocument(plotId: number, form: FormData): Promise<Document> {
    if (!db.plots.some((p) => p.id === plotId)) throw new Error('Plot not found')
    const docType = (form.get('docType') as DocType) || 'other'
    const allowed: DocType[] = ['khatiyan', 'kewala', 'rashid', 'jamabandi', 'other']
    if (!allowed.includes(docType)) throw new Error('Invalid docType')

    const file = form.get('file')
    let fileDataUrl: string | null = null
    let originalName: string | null = null
    if (file instanceof File && file.size > 0) {
      originalName = file.name
      fileDataUrl = await readFileAsDataUrl(file)
    }

    const next = cloneDb(db)
    const doc: Document = {
      id: next.nextIds.document++,
      plotId,
      docType,
      referenceNo: String(form.get('referenceNo') ?? '').trim(),
      docDate: (form.get('docDate') as string) || null,
      filePath: fileDataUrl,
      originalName,
      remarks: String(form.get('remarks') ?? '').trim(),
      createdAt: nowIso(),
    }
    next.documents.push(doc)
    commit(next)
    return doc
  },

  deleteDocument(id: number) {
    const next = cloneDb(db)
    if (!next.documents.some((d) => d.id === id)) throw new Error('Document not found')
    next.documents = next.documents.filter((d) => d.id !== id)
    commit(next)
  },

  getFamilyMembers(): FamilyMember[] {
    return [...db.familyMembers].sort((a, b) => a.fullName.localeCompare(b.fullName))
  },

  getFamilyTree(): FamilyTreePayload {
    return buildTree(
      [...db.familyMembers].sort((a, b) => a.fullName.localeCompare(b.fullName)),
      [...db.relationships]
    )
  },

  getFamilyMember(id: number) {
    const member = db.familyMembers.find((m) => m.id === id)
    if (!member) throw new Error('Family member not found')
    const relationships = db.relationships.filter(
      (r) => r.personId === id || r.relativeId === id
    )
    const ownedPlots = db.plotOwners
      .filter((o) => o.memberId === id)
      .map((o) => {
        const plot = db.plots.find((p) => p.id === o.plotId)
        return {
          ...o,
          plot: plot
            ? {
                id: plot.id,
                khesra: plot.khesra,
                rakbaDecimal: plot.rakbaDecimal,
                acquisitionType: plot.acquisitionType,
              }
            : undefined,
        }
      })
    return { ...member, relationships, ownedPlots }
  },

  createFamilyMember(body: FamilyMemberInput): FamilyMember {
    if (!body.fullName?.trim()) throw new Error('fullName is required')
    const next = cloneDb(db)
    const stamp = nowIso()
    const member: FamilyMember = {
      id: next.nextIds.member++,
      fullName: body.fullName.trim(),
      gender: body.gender ?? '',
      birthYear: body.birthYear ?? null,
      deathYear: body.deathYear ?? null,
      isLiving: body.isLiving ?? true,
      generationHint: body.generationHint ?? null,
      phone: body.phone?.trim() ?? '',
      notes: body.notes?.trim() ?? '',
      createdAt: stamp,
      updatedAt: stamp,
    }
    next.familyMembers.push(member)
    commit(next)
    return member
  },

  updateFamilyMember(id: number, body: Partial<FamilyMemberInput>): FamilyMember {
    const next = cloneDb(db)
    const idx = next.familyMembers.findIndex((m) => m.id === id)
    if (idx < 0) throw new Error('Family member not found')
    const existing = next.familyMembers[idx]
    next.familyMembers[idx] = {
      ...existing,
      fullName: body.fullName !== undefined ? body.fullName.trim() : existing.fullName,
      gender: body.gender ?? existing.gender,
      birthYear: body.birthYear !== undefined ? body.birthYear : existing.birthYear,
      deathYear: body.deathYear !== undefined ? body.deathYear : existing.deathYear,
      isLiving: body.isLiving !== undefined ? body.isLiving : existing.isLiving,
      generationHint:
        body.generationHint !== undefined ? body.generationHint : existing.generationHint,
      phone: body.phone !== undefined ? body.phone.trim() : existing.phone,
      notes: body.notes !== undefined ? body.notes.trim() : existing.notes,
      updatedAt: nowIso(),
    }
    commit(next)
    return { ...next.familyMembers[idx] }
  },

  deleteFamilyMember(id: number) {
    const next = cloneDb(db)
    if (!next.familyMembers.some((m) => m.id === id)) throw new Error('Family member not found')
    next.familyMembers = next.familyMembers.filter((m) => m.id !== id)
    next.relationships = next.relationships.filter(
      (r) => r.personId !== id && r.relativeId !== id
    )
    next.plotOwners = next.plotOwners.filter((o) => o.memberId !== id)
    commit(next)
  },

  createRelationship(body: {
    personId: number
    relativeId: number
    relationType: RelationType
    notes?: string
  }): FamilyRelationship {
    if (!body.personId || !body.relativeId || !body.relationType) {
      throw new Error('personId, relativeId, and relationType are required')
    }
    if (body.personId === body.relativeId) {
      throw new Error('Cannot relate a person to themselves')
    }
    if (
      !db.familyMembers.some((m) => m.id === body.personId) ||
      !db.familyMembers.some((m) => m.id === body.relativeId)
    ) {
      throw new Error('One or both family members not found')
    }
    if (
      db.relationships.some(
        (r) =>
          r.personId === body.personId &&
          r.relativeId === body.relativeId &&
          r.relationType === body.relationType
      )
    ) {
      throw new Error('This relationship already exists')
    }
    const next = cloneDb(db)
    const rel: FamilyRelationship = {
      id: next.nextIds.relationship++,
      personId: body.personId,
      relativeId: body.relativeId,
      relationType: body.relationType,
      notes: body.notes?.trim() ?? '',
      createdAt: nowIso(),
    }
    next.relationships.push(rel)
    commit(next)
    return rel
  },

  deleteRelationship(id: number) {
    const next = cloneDb(db)
    if (!next.relationships.some((r) => r.id === id)) throw new Error('Relationship not found')
    next.relationships = next.relationships.filter((r) => r.id !== id)
    commit(next)
  },

  linkPlotOwner(body: {
    plotId: number
    memberId: number
    shareDecimal?: number | null
    role?: string
    notes?: string
  }): PlotOwnerLink {
    const role = (body.role as OwnerRole) || 'owner'
    if (!['owner', 'co-owner', 'heir'].includes(role)) throw new Error('Invalid ownership role')
    if (
      !db.plots.some((p) => p.id === body.plotId) ||
      !db.familyMembers.some((m) => m.id === body.memberId)
    ) {
      throw new Error('Plot or family member not found')
    }
    if (db.plotOwners.some((o) => o.plotId === body.plotId && o.memberId === body.memberId)) {
      throw new Error('This member is already linked to the plot')
    }
    const next = cloneDb(db)
    const link: PlotOwnerLink = {
      id: next.nextIds.plotOwner++,
      plotId: body.plotId,
      memberId: body.memberId,
      shareDecimal: body.shareDecimal ?? null,
      role,
      notes: body.notes?.trim() ?? '',
      createdAt: nowIso(),
    }
    next.plotOwners.push(link)
    commit(next)
    const plot = next.plots.find((p) => p.id === body.plotId)!
    const member = next.familyMembers.find((m) => m.id === body.memberId)!
    return {
      ...link,
      plot: {
        id: plot.id,
        khesra: plot.khesra,
        rakbaDecimal: plot.rakbaDecimal,
        acquisitionType: plot.acquisitionType,
      },
      member: { id: member.id, fullName: member.fullName },
    }
  },

  unlinkPlotOwner(id: number) {
    const next = cloneDb(db)
    if (!next.plotOwners.some((o) => o.id === id)) {
      throw new Error('Plot ownership link not found')
    }
    next.plotOwners = next.plotOwners.filter((o) => o.id !== id)
    commit(next)
  },
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function exportDatabaseFile() {
  const blob = new Blob([JSON.stringify(store.getSnapshot(), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `zameen-data-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importDatabaseFile(file: File) {
  const text = await file.text()
  const payload = JSON.parse(text) as AppDatabase
  store.importDatabase(payload)
}
