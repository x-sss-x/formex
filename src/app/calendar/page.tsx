"use client"

import { useState } from "react"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarMeta, CalendarEvent, CALENDAR_FORMATS, WEEK_DAYS } from "@/types/calendar"
import CalendarStep1 from "@/components/calendar/calendar-step1"
import CalendarStep2 from "@/components/calendar/calendar-step2"
import CalendarPrint from "@/components/calendar/calendar-print"
import {
  CalendarDays,
  Plus,
  Printer,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Step = "list" | "step1" | "step2" | "print"

type CalendarRow = {
  id: string
  academicYear: string
  calendarType: "institution" | "program"
  formNo: string | null
  totalWeeks: number
  createdAt: string
  institutionId: string
  institutionName: string | null
  institutionCode: string | null
  branchId: string | null
  branchName: string | null
  departmentId: string | null
  departmentName: string | null
}

function buildInitialEvents(totalWeeks: number): CalendarEvent[] {
  const events: CalendarEvent[] = []
  for (let w = 1; w <= totalWeeks; w++) {
    WEEK_DAYS.forEach((day) => {
      events.push({
        weekNumber: w,
        dayName: day,
        date: "",
        morningActivity: "",
        afternoonActivity: "",
      })
    })
  }
  return events
}

export default function CalendarPage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<Step>("list")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [printCalendarId, setPrintCalendarId] = useState<string | null>(null)

  const [meta, setMeta] = useState<CalendarMeta>({
    institutionId: "",
    institutionName: "",
    institutionCode: "",
    branchId: null,
    branchName: null,
    departmentId: null,
    departmentName: null,
    academicYear: "",
    calendarType: "institution",
    formNo: "",
    revision: "",
    headerDate: "",
    totalWeeks: 4,
    email: null,
    phone: null,
    logoUrl: null,
  })

  const [events, setEvents] = useState<CalendarEvent[]>(buildInitialEvents(4))

  const { data: calendars, isLoading } = useQuery(
    trpc.calendar.getAll.queryOptions()
  )

  const deleteMutation = useMutation(
    trpc.calendar.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.calendar.getAll.queryOptions())
      },
    })
  )

  function handleNew() {
    setEditingId(null)
    setMeta({
      institutionId: "",
      institutionName: "",
      institutionCode: "",
      branchId: null,
      branchName: null,
      departmentId: null,
      departmentName: null,
      academicYear: "",
      calendarType: "institution",
      formNo: "",
      revision: "",
      headerDate: "",
      totalWeeks: 4,
      email: null,
      phone: null,
      logoUrl: null,
    })
    setEvents(buildInitialEvents(4))
    setStep("step1")
  }

  function handleStep1Done(updatedMeta: CalendarMeta, calendarId: string) {
    setEditingId(calendarId)
    setMeta(updatedMeta)
    setEvents(buildInitialEvents(updatedMeta.totalWeeks))
    setStep("step2")
  }

  function handleStep2Done(savedEvents: CalendarEvent[]) {
    setEvents(savedEvents)
    setStep("list")
    queryClient.invalidateQueries(trpc.calendar.getAll.queryOptions())
  }

  function handlePrint(id: string) {
    setPrintCalendarId(id)
    setStep("print")
  }

  const formatLabel = (type: string) =>
    CALENDAR_FORMATS.find((f) => f.id === type)?.formatCode ?? type

  if (step === "step1") {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <Button onClick={() => setStep("list")} className="hover:text-foreground transition-colors">
              Calendars
            </Button>
            <span>/</span>
            <span className="text-foreground font-medium">New Calendar</span>
          </div>
          <CalendarStep1
            meta={meta}
            onDone={handleStep1Done}
            onBack={() => setStep("list")}
          />
        </div>
      </div>
    )
  }

  if (step === "step2" && editingId) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <Button onClick={() => setStep("list")} className="hover:text-foreground transition-colors">
              Calendars
            </Button>
            <span>/</span>
            <Button onClick={() => setStep("step1")} className="hover:text-foreground transition-colors">
              Details
            </Button>
            <span>/</span>
            <span className="text-foreground font-medium">Activities</span>
          </div>
          <CalendarStep2
            calendarId={editingId}
            meta={meta}
            events={events}
            setEvents={setEvents}
            onDone={handleStep2Done}
            onBack={() => setStep("step1")}
            onPrint={() => handlePrint(editingId)}
          />
        </div>
      </div>
    )
  }

  if (step === "print" && printCalendarId) {
    return (
      <CalendarPrint
        calendarId={printCalendarId}
        onBack={() => setStep("list")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              Academic Calendars
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage INS-FORMAT-3 and INS-FORMAT-4 academic calendars
            </p>
          </div>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Calendar
          </Button>
        </div>

        <Separator />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : calendars && calendars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(calendars as CalendarRow[]).map((cal) => (
              <Card key={cal.id} className="group hover:shadow-md transition-shadow border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {cal.institutionName ?? "—"}
                      </CardTitle>
                      <CardDescription className="mt-0.5 text-xs">
                        Code: {cal.institutionCode ?? "—"}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {formatLabel(cal.calendarType)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <div className="text-xs text-muted-foreground space-y-1">
                    {cal.branchName && (
                      <p className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {cal.branchName}
                        {cal.departmentName && ` › ${cal.departmentName}`}
                      </p>
                    )}
                    <p>Academic Year: <span className="font-medium text-foreground">{cal.academicYear}</span></p>
                    <p>Weeks: <span className="font-medium text-foreground">{cal.totalWeeks}</span></p>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => handlePrint(cal.id)}>
                      <Printer className="h-3 w-3" /> Print
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => { setEditingId(cal.id); setStep("step2") }}>
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:text-destructive" onClick={() => setDeleteId(cal.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold">No calendars yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              Create your first academic calendar to get started.
            </p>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="h-4 w-4" /> New Calendar
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Calendar?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the calendar and all its activities. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate({ id: deleteId })
                  setDeleteId(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}