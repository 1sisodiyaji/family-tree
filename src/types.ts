export type AcquisitionType = 'khatiyan' | 'kewala' | 'rashid' | 'other'
export type DocType = 'khatiyan' | 'kewala' | 'rashid' | 'jamabandi' | 'other'
export type Gender = '' | 'male' | 'female' | 'other'
export type RelationType = 'parent' | 'spouse'
export type OwnerRole = 'owner' | 'co-owner' | 'heir'

export interface MaujaConfig {
  district: string
  anchal: string
  halka: string
  maujaName: string
  thanaNo: string
  updatedAt?: string
}

export interface Chauhaddi {
  north: string
  south: string
  east: string
  west: string
}

export interface Document {
  id: number
  plotId: number
  docType: DocType
  referenceNo: string
  docDate: string | null
  filePath: string | null
  originalName: string | null
  remarks: string
  createdAt: string
}

export interface Plot {
  id: number
  khesra: string
  khata: string
  jamabandiNo: string
  rakbaDecimal: number
  rakbaAcre: number
  shareDecimal: number | null
  chauhaddi: Chauhaddi
  landClass: string
  acquisitionType: AcquisitionType
  ownerName: string
  notes: string
  geo: { type: string; coordinates: unknown } | null
  thanaNo: string
  createdAt: string
  updatedAt: string
  documents?: Document[]
}

export interface PlotInput {
  khesra: string
  khata: string
  jamabandiNo: string
  rakbaDecimal: number
  shareDecimal: number | null
  chauhaddiNorth: string
  chauhaddiSouth: string
  chauhaddiEast: string
  chauhaddiWest: string
  landClass: string
  acquisitionType: AcquisitionType
  ownerName: string
  notes: string
}

export interface Stats {
  plotCount: number
  totalDecimal: number
  totalAcre: number
  familyMemberCount: number
  livingMemberCount: number
  byAcquisition: Record<string, { count: number; totalDecimal: number }>
  recent: Array<{
    id: number
    khesra: string
    khata: string
    rakbaDecimal: number
    acquisitionType: string
    ownerName: string
    updatedAt: string
  }>
}

export interface FamilyMember {
  id: number
  fullName: string
  gender: Gender
  birthYear: number | null
  deathYear: number | null
  isLiving: boolean
  generationHint: number | null
  phone: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface FamilyMemberInput {
  fullName: string
  gender: Gender
  birthYear: number | null
  deathYear: number | null
  isLiving: boolean
  generationHint: number | null
  phone: string
  notes: string
}

export interface FamilyRelationship {
  id: number
  personId: number
  relativeId: number
  relationType: RelationType
  notes: string
  createdAt: string
}

export interface PlotOwnerLink {
  id: number
  plotId: number
  memberId: number
  shareDecimal: number | null
  role: OwnerRole
  notes: string
  createdAt: string
  plot?: {
    id: number
    khesra: string
    rakbaDecimal?: number
    acquisitionType?: string
  }
  member?: {
    id: number
    fullName: string
  }
}

export interface FamilyTreeNode {
  memberId: number
  spouseIds: number[]
  children: FamilyTreeNode[]
}

export interface FamilyTreePayload {
  members: FamilyMember[]
  relationships: FamilyRelationship[]
  roots: number[]
  tree: FamilyTreeNode[]
}
