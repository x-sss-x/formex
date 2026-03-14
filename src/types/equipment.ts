export type EquipmentMeta = {
  institutionId: string
  institutionName: string
  institutionCode: string
  branchId?: string | null
  branchName?: string | null
  departmentId?: string | null
  departmentName?: string | null
  program: string
  semester: string
  academicYear: string
  labWorkshop: string
  formatType: "H33" | "33"
  formNo: string
  revision: string
  headerDate: string
  email?: string | null
  phone?: string | null
  logoUrl?: string | null
}

export type EquipmentItem = {
  id?: string
  slNo: number
  name: string
  qtyAsSyllabus: string
  qtyAvailable: string
  dateOfPurchase: string
  workingStatus: "working" | "not_working" | ""
  reasonsNotWorking: string
  remarks: string
}

export const EQUIPMENT_FORMATS = [
  {
    id: "H33" as const,
    label: "INS-FORMAT-H33",
    description: "Aided / Private Polytechnic",
  },
  {
    id: "33" as const,
    label: "INS-FORMAT-33",
    description: "Government Polytechnic",
  },
]