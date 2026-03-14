"use client"

import { useRef } from "react"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { CALENDAR_FORMATS, WEEK_DAYS } from "@/types/calendar"
import { ArrowLeft, Printer, Loader2 } from "lucide-react"
import Image from "next/image"

type CalendarEvent = {
  id: string
  weekNumber: number
  dayName: string
  date: string | null
  morningActivity: string | null
  afternoonActivity: string | null
}

type Props = {
  calendarId: string
  onBack: () => void
}

export default function CalendarPrint({ calendarId, onBack }: Props) {
  const trpc = useTRPC()
  const printRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery(
    trpc.calendar.getById.queryOptions({ id: calendarId })
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Calendar not found.</p>
      </div>
    )
  }

  const format = CALENDAR_FORMATS.find((f) => f.id === data.calendarType)
  const events = (data.events ?? []) as CalendarEvent[]
  const weeks = Array.from(
    new Set(events.map((e) => e.weekNumber))
  ).sort((a, b) => a - b)

  return (
    <>
      {/* Print action bar */}
      <div className="no-print bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-sm text-muted-foreground font-medium">
          {format?.formatCode} — {data.institutionName} — {data.academicYear}
        </div>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>

      {/* Print preview */}
      <div className="bg-gray-100 min-h-screen py-8 no-print-bg">
        <div
          ref={printRef}
          id="print-area"
          className="print-container bg-white mx-auto shadow-sm"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "10mm",
            fontFamily: "Arial, sans-serif",
            fontSize: "10pt",
          }}
        >
          {/* ── HEADER ── */}
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", marginBottom: "8pt" }}>
            <tbody>
              <tr>
                {/* Logo */}
                <td style={{ width: "80pt", border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "4pt" }}>
                  {data.institutionLogoUrl ? (
                    <Image
                      src={data.institutionLogoUrl}
                      alt="Logo"
                      width={60}
                      height={60}
                      style={{ objectFit: "contain" }}
                      unoptimized
                    />
                  ) : (
                    <div style={{ width: "60pt", height: "60pt", border: "1px dashed #ccc", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "7pt", color: "#aaa" }}>
                      LOGO
                    </div>
                  )}
                </td>

                {/* Center */}
                <td style={{ border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "4pt" }}>
                  <div style={{ fontWeight: "bold", fontSize: "11pt" }}>GOVERNMENT OF KARNATAKA</div>
                  <div style={{ fontSize: "9pt" }}>Department of Collegiate and Technical Education</div>
                  <div style={{ fontWeight: "bold", fontSize: "10pt", marginTop: "2pt" }}>
                    {data.institutionName ? data.institutionName.toUpperCase() : "GOVERNMENT/ AIDED/PRIVATE POLYTECHNIC, __________"}
                  </div>
                  <div style={{ fontSize: "9pt" }}>- {data.institutionCode ?? "00000"}</div>
                  <div style={{ fontSize: "8pt", marginTop: "2pt" }}>
                    E-Mail: {data.institutionEmail ?? "—"}&nbsp;&nbsp; Phone: {data.institutionPhone ?? "—"}
                  </div>
                </td>

                {/* Right */}
                <td style={{ width: "90pt", border: "1px solid black", verticalAlign: "top", padding: "4pt", fontSize: "9pt" }}>
                  <div>Form No: {data.formNo ?? ""}</div>
                  <div style={{ marginTop: "4pt" }}>Revision: {data.revision ?? ""}</div>
                  <div style={{ marginTop: "4pt" }}>Date: {data.headerDate ?? ""}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── FORMAT TITLE ── */}
          <div style={{ textAlign: "center", marginBottom: "6pt" }}>
            <div style={{ fontWeight: "bold", fontSize: "11pt" }}>{format?.formatCode}</div>
            <div style={{ fontWeight: "bold", fontSize: "11pt", marginTop: "2pt" }}>{format?.title}</div>
          </div>

          {/* ── META ROW ── */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6pt", fontSize: "9pt" }}>
            <div><strong>Institution Name:</strong> {data.institutionName}</div>
            <div><strong>Institution code:</strong> {data.institutionCode}</div>
            <div><strong>Academic year:</strong> {data.academicYear}</div>
          </div>

          {/* ── TABLE ── */}
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", fontSize: "8.5pt" }}>
            <thead>
              <tr>
                <th rowSpan={2} style={{ border: "1px solid black", textAlign: "center", padding: "3pt 6pt", width: "32pt" }}>Week</th>
                <th rowSpan={2} style={{ border: "1px solid black", textAlign: "center", padding: "3pt 6pt", width: "52pt" }}>Day</th>
                <th rowSpan={2} style={{ border: "1px solid black", textAlign: "center", padding: "3pt 6pt", width: "48pt" }}>Date</th>
                <th colSpan={2} style={{ border: "1px solid black", textAlign: "center", padding: "3pt 6pt" }}>Activities</th>
              </tr>
              <tr>
                <th style={{ border: "1px solid black", textAlign: "center", padding: "3pt 6pt", width: "50%" }}>Morning Session</th>
                <th style={{ border: "1px solid black", textAlign: "center", padding: "3pt 6pt", width: "50%" }}>Afternoon Session</th>
              </tr>
            </thead>

            <tbody>
              {weeks.map((week) => {
                const weekEvents = events.filter((e) => e.weekNumber === week)
                return WEEK_DAYS.map((day, dayIdx) => {
                  const ev = weekEvents.find((e) => e.dayName === day)
                  const isSunday = day === "Sunday"
                  const showWeek = dayIdx === 0

                  return (
                    <tr key={`${week}-${day}`} style={{ backgroundColor: isSunday ? "#BDD7EE" : "transparent" }}>
                      {showWeek && (
                        <td rowSpan={7} style={{ border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "3pt", fontWeight: "500" }}>
                          {week}
                        </td>
                      )}
                      <td style={{ border: "1px solid black", padding: "3pt 6pt" }}>{day}</td>
                      <td style={{ border: "1px solid black", padding: "3pt 6pt", textAlign: "center" }}>{ev?.date ?? ""}</td>
                      <td style={{ border: "1px solid black", padding: "3pt 6pt" }}>{ev?.morningActivity ?? ""}</td>
                      <td style={{ border: "1px solid black", padding: "3pt 6pt" }}>{ev?.afternoonActivity ?? ""}</td>
                    </tr>
                  )
                })
              })}
            </tbody>
          </table>

          {/* ── NOTE & SIGNATURES ── */}
          <div style={{ marginTop: "12pt", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ maxWidth: "65%", fontSize: "8pt" }}>
              <strong>Note</strong> {format?.note}
            </div>
            <div style={{ textAlign: "right", fontSize: "9pt" }}>
              {format?.signatureLeft && (
                <div style={{ marginBottom: "8pt" }}>{format.signatureLeft}</div>
              )}
              <div>{format?.signatureRight}</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .no-print-bg { background: white !important; padding: 0 !important; }
          #print-area { box-shadow: none !important; margin: 0 !important; width: 100% !important; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </>
  )
}