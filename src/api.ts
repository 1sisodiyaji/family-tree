import { store } from '@/data/store'
import type {
  Document,
  FamilyMember,
  FamilyMemberInput,
  FamilyRelationship,
  FamilyTreePayload,
  MaujaConfig,
  Plot,
  PlotInput,
  PlotOwnerLink,
  RelationType,
  Stats,
} from '@/types'

function ok<T>(value: T): Promise<T> {
  return Promise.resolve(value)
}

function fail(err: unknown): never {
  throw err instanceof Error ? err : new Error(String(err))
}

export const api = {
  getConfig: () => ok(store.getConfig()),
  updateConfig: (body: Partial<MaujaConfig>) => {
    try {
      return ok(store.updateConfig(body))
    } catch (e) {
      return fail(e)
    }
  },

  getStats: () => ok(store.getStats()),

  getPlots: (params?: { acquisitionType?: string; q?: string }) =>
    ok(store.getPlots(params)),

  getPlot: (id: number) => {
    try {
      return ok(store.getPlot(id))
    } catch (e) {
      return fail(e)
    }
  },

  createPlot: (body: PlotInput) => {
    try {
      return ok(store.createPlot(body))
    } catch (e) {
      return fail(e)
    }
  },

  updatePlot: (id: number, body: Partial<PlotInput>) => {
    try {
      return ok(store.updatePlot(id, body))
    } catch (e) {
      return fail(e)
    }
  },

  deletePlot: (id: number) => {
    try {
      store.deletePlot(id)
      return ok(undefined as void)
    } catch (e) {
      return fail(e)
    }
  },

  uploadDocument: (plotId: number, form: FormData) =>
    store.uploadDocument(plotId, form).catch((e) => fail(e)),

  deleteDocument: (id: number) => {
    try {
      store.deleteDocument(id)
      return ok(undefined as void)
    } catch (e) {
      return fail(e)
    }
  },

  getFamilyMembers: () => ok(store.getFamilyMembers()),
  getFamilyTree: () => ok(store.getFamilyTree()),
  getFamilyMember: (id: number) => {
    try {
      return ok(
        store.getFamilyMember(id) as FamilyMember & {
          relationships: FamilyRelationship[]
          ownedPlots: PlotOwnerLink[]
        }
      )
    } catch (e) {
      return fail(e)
    }
  },

  createFamilyMember: (body: FamilyMemberInput) => {
    try {
      return ok(store.createFamilyMember(body))
    } catch (e) {
      return fail(e)
    }
  },

  updateFamilyMember: (id: number, body: Partial<FamilyMemberInput>) => {
    try {
      return ok(store.updateFamilyMember(id, body))
    } catch (e) {
      return fail(e)
    }
  },

  deleteFamilyMember: (id: number) => {
    try {
      store.deleteFamilyMember(id)
      return ok(undefined as void)
    } catch (e) {
      return fail(e)
    }
  },

  createRelationship: (body: {
    personId: number
    relativeId: number
    relationType: RelationType
    notes?: string
  }) => {
    try {
      return ok(store.createRelationship(body))
    } catch (e) {
      return fail(e)
    }
  },

  deleteRelationship: (id: number) => {
    try {
      store.deleteRelationship(id)
      return ok(undefined as void)
    } catch (e) {
      return fail(e)
    }
  },

  linkPlotOwner: (body: {
    plotId: number
    memberId: number
    shareDecimal?: number | null
    role?: string
    notes?: string
  }) => {
    try {
      return ok(store.linkPlotOwner(body))
    } catch (e) {
      return fail(e)
    }
  },

  unlinkPlotOwner: (id: number) => {
    try {
      store.unlinkPlotOwner(id)
      return ok(undefined as void)
    } catch (e) {
      return fail(e)
    }
  },
}

// Keep type exports used by pages for FamilyTreePayload if needed
export type { FamilyTreePayload, Plot, Document, Stats }
