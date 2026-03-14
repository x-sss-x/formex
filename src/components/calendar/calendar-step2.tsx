"use client"

import { useState } from "react"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarMeta, CalendarEvent, WEEK_DAYS } from "@/types/calendar"
import {
  ArrowLeft,
  Printer,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

type DBEvent = {
  id: string
  weekNumber: number
  dayName: string
  date: string | null
  morningActivity: string | null
  afternoonActivity: string | null
}

type Props = {
  calendarId: string
  meta: CalendarMeta
  events: CalendarEvent[]
  setEvents: (v: CalendarEvent[]) => void
  onDone: (events: CalendarEvent[]) => void
  onBack: () => void
  onPrint: () => void
}

export default function CalendarStep2({
  calendarId,
  meta,
  events,
  setEvents,
  onDone,
  onBack,
  onPrint,
}: Props) {
  const trpc = useTRPC()
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]))
  const [saving, setSaving] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const bulkUpsert = useMutation(trpc.event.bulkUpsert.mutationOptions())

  // Load existing events from DB if editing
  useQuery({
    ...trpc.event.getByCalendar.queryOptions({ calendarId }),
    enabled: !!calendarId,
    onSuccess: (existingEvents: DBEvent[]) => {
      if (hydrated || !existingEvents || existingEvents.length === 0) return
      setHydrated(true)
      setEvents(
        events.map((e) => {
          const found = existingEvents.find(
            (db: DBEvent) => db.weekNumber === e.weekNumber && db.dayName === e.dayName
          )
          if (found) {
            return {
              ...e,
              id: found.id,
              date: found.date ?? "",
              morningActivity: found.morningActivity ?? "",
              afternoonActivity: found.afternoonActivity ?? "",
            }
          }
          return e
        })
      )
    },
  } as Parameters<typeof useQuery>[0])

  function handleCell(
    weekNumber: number,
    dayName: string,
    key: keyof CalendarEvent,
    value: string
  ) {
    setEvents(
      events.map((e) =>
        e.weekNumber === weekNumber && e.dayName === dayName
          ? { ...e, [key]: value }
          : e
      )
    )
  }

  function toggleWeek(week: number) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev)
      if (next.has(week)) next.delete(week)
      else next.add(week)
      return next
    })
  }

  function expandAll() {
    const all = new Set<number>()
    for (let w = 1; w <= meta.totalWeeks; w++) all.add(w)
    setExpandedWeeks(all)
  }

  function collapseAll() {
    setExpandedWeeks(new Set())
  }

  async function handleSave() {
    setSaving(true)
    try {
      await bulkUpsert.mutateAsync({
        calendarId,
        events: events.map((e) => ({
          weekNumber: e.weekNumber,
          dayName: e.dayName,
          date: e.date || null,
          morningActivity: e.morningActivity || null,
          afternoonActivity: e.afternoonActivity || null,
        })),
      })
      onDone(events)
    } finally {
      setSaving(false)
    }
  }

  const weeks = Array.from({ length: meta.totalWeeks }, (_, i) => i + 1)

  return (
    <div className="space-y-4">

      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Step 2 — Activities</CardTitle>
              <CardDescription className="mt-1">
                Fill in morning and afternoon activities for each day.
                <span className="ml-2 font-medium text-foreground">
                  {meta.institutionName}
                </span>
                {meta.branchName && (
                  <span className="text-muted-foreground"> › {meta.branchName}</span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline">{meta.academicYear}</Badge>
              <Badge variant="secondary">
                {meta.calendarType === "institution" ? "INS-FORMAT-3" : "INS-FORMAT-4"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>Expand All</Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>Collapse All</Button>
            <span className="text-xs text-muted-foreground ml-2">
              {meta.totalWeeks} weeks · {meta.totalWeeks * 7} days total
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Week Accordions */}
      <div className="space-y-2">
        {weeks.map((week) => {
          const isOpen = expandedWeeks.has(week)
          const weekEvents = events.filter((e) => e.weekNumber === week)
          const filledCount = weekEvents.filter(
            (e) => e.morningActivity || e.afternoonActivity
          ).length

          return (
            <Card key={week} className="overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => toggleWeek(week)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">Week {week}</span>
                  {filledCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filledCount} / 7 filled
                    </Badge>
                  )}
                </div>
                {isOpen
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                }
              </button>

              {isOpen && (
                <div className="border-t overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 text-xs">
                        <th className="text-left px-4 py-2 font-medium w-32">Day</th>
                        <th className="text-left px-4 py-2 font-medium w-36">Date</th>
                        <th className="text-left px-4 py-2 font-medium">Morning Session</th>
                        <th className="text-left px-4 py-2 font-medium">Afternoon Session</th>
                      </tr>
                    </thead>
                    <tbody>
                      {WEEK_DAYS.map((day) => {
                        const ev = weekEvents.find((e) => e.dayName === day)
                        if (!ev) return null
                        const isSunday = day === "Sunday"

                        return (
                          <tr
                            key={day}
                            className={cn("border-t", isSunday && "bg-blue-50/60")}
                          >
                            <td className="px-4 py-1.5">
                              <span className={cn("text-sm font-medium", isSunday && "text-blue-600")}>
                                {day}
                              </span>
                            </td>
                            <td className="px-4 py-1.5">
                              <Input
                                type="date"
                                value={ev.date}
                                onChange={(e) => handleCell(week, day, "date", e.target.value)}
                                className="h-8 text-xs"
                              />
                            </td>
                            <td className="px-4 py-1.5">
                              <Input
                                value={ev.morningActivity}
                                placeholder="Morning activity..."
                                onChange={(e) => handleCell(week, day, "morningActivity", e.target.value)}
                                className="h-8 text-xs"
                                disabled={isSunday}
                              />
                            </td>
                            <td className="px-4 py-1.5">
                              <Input
                                value={ev.afternoonActivity}
                                placeholder="Afternoon activity..."
                                onChange={(e) => handleCell(week, day, "afternoonActivity", e.target.value)}
                                className="h-8 text-xs"
                                disabled={isSunday}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onPrint} className="gap-2">
            <Printer className="h-4 w-4" /> Preview & Print
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Save className="h-4 w-4" />
            }
            Save Calendar
          </Button>
        </div>
      </div>
    </div>
  )
}