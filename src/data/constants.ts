import type {
  Document,
  FamilyMember,
  FamilyRelationship,
  MaujaConfig,
  Plot,
  PlotOwnerLink,
} from '@/types'

export const STORAGE_KEY = 'zameen-db-v2'

export interface AppDatabase {
  config: MaujaConfig
  plots: Plot[]
  documents: Document[]
  familyMembers: FamilyMember[]
  relationships: FamilyRelationship[]
  plotOwners: PlotOwnerLink[]
  nextIds: {
    plot: number
    document: number
    member: number
    relationship: number
    plotOwner: number
  }
}

/** Seed copied from server SQLite (family tree + plots). */
export const INITIAL_CONFIG: MaujaConfig = {
  district: "Sample District",
  anchal: "Sample Anchal",
  halka: "Halka 1",
  maujaName: "Mauja Demo",
  thanaNo: "113",
  updatedAt: "2026-11-13 10:06:07",
}

export const INITIAL_PLOTS: Plot[] = [
  {
    "id": 1,
    "khesra": "245",
    "khata": "18",
    "jamabandiNo": "JB-1001",
    "rakbaDecimal": 12.5,
    "rakbaAcre": 0.125,
    "shareDecimal": null,
    "chauhaddi": {
      "north": "Khesra 244",
      "south": "Village road",
      "east": "Khesra 246",
      "west": "Aahar"
    },
    "landClass": "agri",
    "acquisitionType": "khatiyan",
    "ownerName": "Ram Kishore",
    "notes": "Ancestral holding from CS/RS khatiyan",
    "geo": null,
    "thanaNo": "113",
    "createdAt": "2026-11-13 10:06:07",
    "updatedAt": "2026-11-13 10:06:07"
  },
  {
    "id": 2,
    "khesra": "512",
    "khata": "42",
    "jamabandiNo": "JB-2044",
    "rakbaDecimal": 6.25,
    "rakbaAcre": 0.0625,
    "shareDecimal": 6.25,
    "chauhaddi": {
      "north": "Khesra 510",
      "south": "Khesra 514",
      "east": "Canal",
      "west": "Khesra 511"
    },
    "landClass": "agri",
    "acquisitionType": "kewala",
    "ownerName": "Suresh Kumar",
    "notes": "Purchased via registered kewala (sale deed)",
    "geo": null,
    "thanaNo": "113",
    "createdAt": "2026-11-13 10:06:07",
    "updatedAt": "2026-11-13 10:06:07"
  },
  {
    "id": 3,
    "khesra": "789",
    "khata": "7",
    "jamabandiNo": "",
    "rakbaDecimal": 3.125,
    "rakbaAcre": 0.0313,
    "shareDecimal": null,
    "chauhaddi": {
      "north": "Bastu",
      "south": "Khesra 790",
      "east": "Path",
      "west": "Khesra 788"
    },
    "landClass": "basgit",
    "acquisitionType": "rashid",
    "ownerName": "Suresh Kumar",
    "notes": "Supported by lagaan rashid; mutation pending confirmation",
    "geo": null,
    "thanaNo": "113",
    "createdAt": "2026-11-13 10:06:07",
    "updatedAt": "2026-11-13 10:06:07"
  }
]

export const INITIAL_DOCUMENTS: Document[] = []

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    "id": 10,
    "fullName": "Late Gumaan Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": false,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:16:44",
    "updatedAt": "2026-11-13 10:43:42"
  },
  {
    "id": 11,
    "fullName": "Late Abhilakh Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": false,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:17:03",
    "updatedAt": "2026-11-13 10:43:55"
  },
  {
    "id": 12,
    "fullName": "Late Roopkali Devi",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": false,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:17:44",
    "updatedAt": "2026-11-13 10:44:04"
  },
  {
    "id": 13,
    "fullName": "Late Saalikh Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": false,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:18:15",
    "updatedAt": "2026-11-13 10:44:22"
  },
  {
    "id": 14,
    "fullName": "Late kashida Kunwar",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": false,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:19:12",
    "updatedAt": "2026-11-13 10:44:28"
  },
  {
    "id": 15,
    "fullName": "Late Raghunandan Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": false,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:19:47",
    "updatedAt": "2026-11-13 10:44:36"
  },
  {
    "id": 16,
    "fullName": "Late dewakali Kunwar",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": false,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:20:15",
    "updatedAt": "2026-11-13 10:44:43"
  },
  {
    "id": 17,
    "fullName": "Late Sankar Dayal Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": false,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:20:55",
    "updatedAt": "2026-11-13 10:44:52"
  },
  {
    "id": 20,
    "fullName": "Maalti kunwar",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:22:50",
    "updatedAt": "2026-11-13 10:22:50"
  },
  {
    "id": 21,
    "fullName": "Sunil Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:23:20",
    "updatedAt": "2026-11-13 10:23:20"
  },
  {
    "id": 22,
    "fullName": "Sheela Devi",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:23:34",
    "updatedAt": "2026-11-13 10:23:34"
  },
  {
    "id": 24,
    "fullName": "Arvind Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:40:09",
    "updatedAt": "2026-11-13 10:40:09"
  },
  {
    "id": 25,
    "fullName": "Manorama Devi",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "9608028732",
    "notes": "",
    "createdAt": "2026-11-13 10:40:44",
    "updatedAt": "2026-11-13 10:52:33"
  },
  {
    "id": 26,
    "fullName": "Pintu Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:41:16",
    "updatedAt": "2026-11-13 10:41:16"
  },
  {
    "id": 27,
    "fullName": "Pushpa Devi",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:41:37",
    "updatedAt": "2026-11-13 10:41:37"
  },
  {
    "id": 28,
    "fullName": "Sourabh Kumar",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:42:49",
    "updatedAt": "2026-11-13 10:43:34"
  },
  {
    "id": 29,
    "fullName": "Manjeet Kumar",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:43:08",
    "updatedAt": "2026-11-13 10:43:08"
  },
  {
    "id": 30,
    "fullName": "Golu Kumar",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:45:12",
    "updatedAt": "2026-11-13 10:45:12"
  },
  {
    "id": 31,
    "fullName": "Subham Kumar",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:45:32",
    "updatedAt": "2026-11-13 10:45:32"
  },
  {
    "id": 32,
    "fullName": "Aman Kumar",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:45:56",
    "updatedAt": "2026-11-13 10:45:56"
  },
  {
    "id": 33,
    "fullName": "Dablu Kumar",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:46:16",
    "updatedAt": "2026-11-13 10:46:16"
  },
  {
    "id": 34,
    "fullName": "Late Gupteswar Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:57:20",
    "updatedAt": "2026-11-13 10:57:20"
  },
  {
    "id": 35,
    "fullName": "Parvati Kunwar",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:58:28",
    "updatedAt": "2026-11-13 10:58:28"
  },
  {
    "id": 36,
    "fullName": "Chintu Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:58:51",
    "updatedAt": "2026-11-13 10:58:51"
  },
  {
    "id": 37,
    "fullName": "Chinta Devi",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:59:13",
    "updatedAt": "2026-11-13 10:59:13"
  },
  {
    "id": 38,
    "fullName": "Ayush Kumar",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:59:33",
    "updatedAt": "2026-11-13 10:59:33"
  },
  {
    "id": 39,
    "fullName": "Khushi Kumari",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 10:59:53",
    "updatedAt": "2026-11-13 10:59:53"
  },
  {
    "id": 40,
    "fullName": "Sobha Devi",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:00:15",
    "updatedAt": "2026-11-13 11:00:15"
  },
  {
    "id": 41,
    "fullName": "Dillu Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:00:41",
    "updatedAt": "2026-11-13 11:00:41"
  },
  {
    "id": 42,
    "fullName": "Late Pati Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:01:31",
    "updatedAt": "2026-11-13 11:01:31"
  },
  {
    "id": 43,
    "fullName": "Late jadu Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": false,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:01:57",
    "updatedAt": "2026-11-14 00:09:07"
  },
  {
    "id": 44,
    "fullName": "Late Bali Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:02:30",
    "updatedAt": "2026-11-13 11:02:30"
  },
  {
    "id": 45,
    "fullName": "Late mosaheb singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:03:14",
    "updatedAt": "2026-11-13 11:03:14"
  },
  {
    "id": 46,
    "fullName": "Late patiram kunwar",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": false,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:03:49",
    "updatedAt": "2026-11-14 00:09:24"
  },
  {
    "id": 47,
    "fullName": "Late Shivnandan Singh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:04:26",
    "updatedAt": "2026-11-13 11:04:26"
  },
  {
    "id": 48,
    "fullName": "Late balkeswar SIngh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:05:37",
    "updatedAt": "2026-11-13 11:05:37"
  },
  {
    "id": 50,
    "fullName": "Late dhanraji Kunwar",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:07:32",
    "updatedAt": "2026-11-13 11:07:32"
  },
  {
    "id": 51,
    "fullName": "Mahendar SIngh",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:07:59",
    "updatedAt": "2026-11-13 11:07:59"
  },
  {
    "id": 52,
    "fullName": "Bindu Devi",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:08:19",
    "updatedAt": "2026-11-13 11:08:19"
  },
  {
    "id": 53,
    "fullName": "Aadarsh KUmar",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:08:42",
    "updatedAt": "2026-11-13 11:08:42"
  },
  {
    "id": 54,
    "fullName": "Anurag Kumar",
    "gender": "male",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:09:01",
    "updatedAt": "2026-11-13 11:09:01"
  },
  {
    "id": 55,
    "fullName": "Lusi Devi",
    "gender": "female",
    "birthYear": null,
    "deathYear": null,
    "isLiving": true,
    "generationHint": null,
    "phone": "",
    "notes": "",
    "createdAt": "2026-11-13 11:09:27",
    "updatedAt": "2026-11-13 11:09:27"
  }
]

export const INITIAL_RELATIONSHIPS: FamilyRelationship[] = [
  {
    "id": 9,
    "personId": 10,
    "relativeId": 11,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:17:23"
  },
  {
    "id": 10,
    "personId": 12,
    "relativeId": 11,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 10:17:54"
  },
  {
    "id": 11,
    "personId": 11,
    "relativeId": 13,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:18:34"
  },
  {
    "id": 12,
    "personId": 14,
    "relativeId": 13,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 10:19:22"
  },
  {
    "id": 13,
    "personId": 13,
    "relativeId": 15,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:19:58"
  },
  {
    "id": 14,
    "personId": 16,
    "relativeId": 15,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 10:20:32"
  },
  {
    "id": 15,
    "personId": 15,
    "relativeId": 17,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:21:09"
  },
  {
    "id": 16,
    "personId": 20,
    "relativeId": 17,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 10:23:00"
  },
  {
    "id": 17,
    "personId": 22,
    "relativeId": 21,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 10:23:41"
  },
  {
    "id": 21,
    "personId": 17,
    "relativeId": 21,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:39:49"
  },
  {
    "id": 22,
    "personId": 17,
    "relativeId": 24,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:40:27"
  },
  {
    "id": 23,
    "personId": 25,
    "relativeId": 24,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 10:40:52"
  },
  {
    "id": 24,
    "personId": 17,
    "relativeId": 26,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:41:26"
  },
  {
    "id": 25,
    "personId": 27,
    "relativeId": 26,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 10:41:45"
  },
  {
    "id": 26,
    "personId": 21,
    "relativeId": 28,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:42:57"
  },
  {
    "id": 27,
    "personId": 21,
    "relativeId": 29,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:43:17"
  },
  {
    "id": 28,
    "personId": 24,
    "relativeId": 30,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:45:23"
  },
  {
    "id": 29,
    "personId": 24,
    "relativeId": 31,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:45:44"
  },
  {
    "id": 30,
    "personId": 26,
    "relativeId": 32,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:46:04"
  },
  {
    "id": 31,
    "personId": 26,
    "relativeId": 33,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:46:26"
  },
  {
    "id": 32,
    "personId": 15,
    "relativeId": 34,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:57:39"
  },
  {
    "id": 33,
    "personId": 35,
    "relativeId": 34,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 10:58:36"
  },
  {
    "id": 34,
    "personId": 34,
    "relativeId": 36,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:59:02"
  },
  {
    "id": 35,
    "personId": 37,
    "relativeId": 36,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 10:59:22"
  },
  {
    "id": 36,
    "personId": 36,
    "relativeId": 38,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 10:59:45"
  },
  {
    "id": 37,
    "personId": 36,
    "relativeId": 39,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 11:00:03"
  },
  {
    "id": 38,
    "personId": 34,
    "relativeId": 40,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 11:00:29"
  },
  {
    "id": 39,
    "personId": 41,
    "relativeId": 40,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 11:00:54"
  },
  {
    "id": 40,
    "personId": 11,
    "relativeId": 42,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 11:01:42"
  },
  {
    "id": 41,
    "personId": 11,
    "relativeId": 43,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 11:02:07"
  },
  {
    "id": 42,
    "personId": 11,
    "relativeId": 44,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 11:02:38"
  },
  {
    "id": 43,
    "personId": 11,
    "relativeId": 45,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 11:03:23"
  },
  {
    "id": 44,
    "personId": 46,
    "relativeId": 45,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 11:04:01"
  },
  {
    "id": 45,
    "personId": 13,
    "relativeId": 47,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 11:04:41"
  },
  {
    "id": 46,
    "personId": 47,
    "relativeId": 48,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 11:05:57"
  },
  {
    "id": 48,
    "personId": 50,
    "relativeId": 48,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 11:07:46"
  },
  {
    "id": 49,
    "personId": 48,
    "relativeId": 51,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 11:08:08"
  },
  {
    "id": 50,
    "personId": 52,
    "relativeId": 51,
    "relationType": "spouse",
    "notes": "",
    "createdAt": "2026-11-13 11:08:29"
  },
  {
    "id": 51,
    "personId": 51,
    "relativeId": 53,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 11:08:52"
  },
  {
    "id": 52,
    "personId": 51,
    "relativeId": 54,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 11:09:10"
  },
  {
    "id": 53,
    "personId": 51,
    "relativeId": 55,
    "relationType": "parent",
    "notes": "",
    "createdAt": "2026-11-13 11:09:41"
  }
]

export const INITIAL_PLOT_OWNERS: PlotOwnerLink[] = []

export function createInitialDatabase(): AppDatabase {
  return {
    config: structuredClone(INITIAL_CONFIG),
    plots: structuredClone(INITIAL_PLOTS),
    documents: structuredClone(INITIAL_DOCUMENTS),
    familyMembers: structuredClone(INITIAL_FAMILY_MEMBERS),
    relationships: structuredClone(INITIAL_RELATIONSHIPS),
    plotOwners: structuredClone(INITIAL_PLOT_OWNERS),
    nextIds: {
  "plot": 4,
  "document": 1,
  "member": 56,
  "relationship": 54,
  "plotOwner": 1
},
  }
}
