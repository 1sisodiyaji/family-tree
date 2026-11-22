import type { AcquisitionType, DocType } from './types'

export const acquisitionLabels: Record<AcquisitionType, string> = {
  khatiyan: 'Khatiyan',
  kewala: 'Kewala',
  rashid: 'Rashid',
  other: 'Other',
}

export const acquisitionHelp: Record<AcquisitionType, string> = {
  khatiyan: 'Ancestral / survey Record of Rights',
  kewala: 'Self-purchased via registered sale deed',
  rashid: 'Supported by lagaan (revenue) receipt',
  other: 'Other provenance',
}

export const docTypeLabels: Record<DocType, string> = {
  khatiyan: 'Khatiyan',
  kewala: 'Kewala',
  rashid: 'Lagaan Rashid',
  jamabandi: 'Jamabandi',
  other: 'Other',
}

export function formatDecimal(n: number) {
  return `${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 4 })} decimal`
}

export function formatAcre(n: number) {
  return `${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 4 })} acre`
}
