"use client"

import { useState, useCallback } from "react"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarMeta, CALENDAR_FORMATS } from "@/types/calendar"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"

type Props = {
  meta: CalendarMeta
  onDone: (meta: CalendarMeta, calendarId: string) => void
  onBack: () => void
}

export default function CalendarStep1({ meta, onDone, onBack }: Props) {
  const trpc = useTRPC()
  const [form, setForm] = useState<CalendarMeta>(meta)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: institutions, isLoading: loadingInstitutions } = useQuery(
    trpc.institution.getAll.queryOptions()
  )

  const { data: branches, isLoading: loadingBranches } = useQuery(
    trpc.branch.getByInstitution.queryOptions(
      { institutionId: form.institutionId },
      { enabled: !!form.institutionId }
    )
  )

  const { data: departmentList, isLoading: loadingDepts } = useQuery(
    trpc.department.getByBranch.queryOptions(
      { branchId: form.branchId ?? "" },
      { enabled: !!form.branchId }
    )
  )

  const createCalendar = useMutation(trpc.calendar.create.mutationOptions())

  function validate() {
    const e: Record<string, string> = {}
    if (!form.institutionId) e.institutionId = "Please select an institution"
    if (!form.academicYear) e.academicYear = "Academic year is required"
    if (!form.calendarType) e.calendarType = "Please select a format"
    if (!form.totalWeeks || form.totalWeeks < 1) e.totalWeeks = "Enter a valid number of weeks"
    return e
  }

  async function handleNext() {
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }
    setErrors({})

    const created = await createCalendar.mutateAsync({
      institutionId: form.institutionId,
      branchId: form.branchId ?? null,
      departmentId: form.departmentId ?? null,
      academicYear: form.academicYear,
      calendarType: form.calendarType,
      formNo: form.formNo || null,
      revision: form.revision || null,
      headerDate: form.headerDate || null,
      totalWeeks: form.totalWeeks,
    })

    if (created) onDone(form, created.id)
  }

  const set = useCallback((key: keyof CalendarMeta, value: string | number | null) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: "" }))
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Step 1 — Calendar Details</CardTitle>
          <CardDescription>
            Select the institution and configure the calendar format.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* ── Institution ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Institution
            </h3>

            <div className="space-y-2">
              <Label>Institution <span className="text-destructive">*</span></Label>
              <Select
                value={form.institutionId}
                onValueChange={(val) => {
                  const inst = institutions?.find((item) => item.id === val)
                  setForm((f) => ({
                    ...f,
                    institutionId: val,
                    institutionName: inst?.name ?? "",
                    institutionCode: inst?.code ?? "",
                    email: inst?.email ?? null,
                    phone: inst?.phone ?? null,
                    logoUrl: inst?.logoUrl ?? null,
                    // reset downstream
                    branchId: null,
                    branchName: null,
                    departmentId: null,
                    departmentName: null,
                  }))
                  setErrors((e) => ({ ...e, institutionId: "" }))
                }}
              >
                <SelectTrigger className={errors.institutionId ? "border-destructive" : ""}>
                  <SelectValue placeholder={loadingInstitutions ? "Loading..." : "Select institution"} />
                </SelectTrigger>
                <SelectContent>
                  {institutions?.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name} ({inst.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.institutionId && (
                <p className="text-xs text-destructive">{errors.institutionId}</p>
              )}
            </div>

            {/* Branch */}
            {form.institutionId && (
              <div className="space-y-2">
                <Label>Branch <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Select
                  value={form.branchId ?? ""}
                  onValueChange={(val) => {
                    const branch = branches?.find((b) => b.id === val)
                    setForm((f) => ({
                      ...f,
                      branchId: val,
                      branchName: branch?.name ?? null,
                      // reset department
                      departmentId: null,
                      departmentName: null,
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBranches ? "Loading..." : "Select branch"} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Department */}
            {form.branchId && (
              <div className="space-y-2">
                <Label>Department <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Select
                  value={form.departmentId ?? ""}
                  onValueChange={(val) => {
                    const dept = departmentList?.find((d) => d.id === val)
                    setForm((f) => ({
                      ...f,
                      departmentId: val,
                      departmentName: dept?.name ?? null,
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDepts ? "Loading..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentList?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          {/* ── Format ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Format
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CALENDAR_FORMATS.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => set("calendarType", fmt.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    form.calendarType === fmt.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <p className="font-semibold text-sm">{fmt.formatCode}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{fmt.title}</p>
                </button>
              ))}
            </div>
            {errors.calendarType && (
              <p className="text-xs text-destructive">{errors.calendarType}</p>
            )}
          </div>

          <Separator />

          {/* ── Academic Details ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Academic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Academic Year <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. 2024-25"
                  value={form.academicYear}
                  onChange={(e) => set("academicYear", e.target.value)}
                  className={errors.academicYear ? "border-destructive" : ""}
                />
                {errors.academicYear && (
                  <p className="text-xs text-destructive">{errors.academicYear}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Number of Weeks <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  min={1}
                  max={52}
                  placeholder="e.g. 30"
                  value={form.totalWeeks || ""}
                  onChange={(e) => set("totalWeeks", parseInt(e.target.value) || 1)}
                  className={errors.totalWeeks ? "border-destructive" : ""}
                />
                {errors.totalWeeks && (
                  <p className="text-xs text-destructive">{errors.totalWeeks}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* ── Print Header Fields ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Print Header Fields
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Form No</Label>
                <Input
                  placeholder="e.g. 001"
                  value={form.formNo}
                  onChange={(e) => set("formNo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Revision</Label>
                <Input
                  placeholder="e.g. 01"
                  value={form.revision}
                  onChange={(e) => set("revision", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.headerDate}
                  onChange={(e) => set("headerDate", e.target.value)}
                />
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={createCalendar.isPending} className="gap-2">
          {createCalendar.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Next — Fill Activities
        </Button>
      </div>
    </div>
  )
}