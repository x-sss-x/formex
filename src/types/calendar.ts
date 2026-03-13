export type CalendarMeta = {
  institutionName: string
  institutionCode: string
  academicYear: string
  email: string
  phone: string
  formNo: string
  revision: string
  date: string
  logo?: string
}

export type CalendarEvent = {
  week: number
  day: string
  date: string
  morning: string
  afternoon: string
}