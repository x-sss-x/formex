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
import { FlaskConical, Plus, Printer, Pencil, Trash2, Building2 } from "lucide-react"
import EquipmentStep1 from "@/components/equipment/equipment-step1"
import EquipmentStep2 from "@/components/equipment/equipment-step2"
import EquipmentPrint from "@/components/equipment/equipment-print"
import type { EquipmentMeta, EquipmentItem } from "@/types/equipment"

type Step = "list" | "step1" | "step2" | "print"

type StatementRow = {
  id: string
  program: string
  semester: string
  academicYear: string
  labWorkshop: string
  formatType: "H33" | "33"
  formNo: string | null
  createdAt: string
  institutionId: string
  institutionName: string | null
  institutionCode: string | null
  branchId: string | null
  branchName: string | null
  departmentId: string | null
  departmentName: string | null
}

const emptyMeta = (): EquipmentMeta => ({
  institutionId: "",
  institutionName: "",
  institutionCode: "",
  branchId: null,
  branchName: null,
  departmentId: null,
  departmentName: null,
  program: "",
  semester: "",
  academicYear: "",
  labWorkshop: "",
  formatType: "H33",
  formNo: "",
  revision: "",
  headerDate: "",
  email: null,
  phone: null,
  logoUrl: null,
})

export default function EquipmentPage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<Step>("list")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [printId, setPrintId] = useState<string | null>(null)
  const [meta, setMeta] = useState<EquipmentMeta>(emptyMeta())
  const [items, setItems] = useState<EquipmentItem[]>([])

  const { data: statements, isLoading } = useQuery(
    trpc.equipment.getAll.queryOptions()
  )

  const deleteMutation = useMutation(
    trpc.equipment.delete.mutationOptions()
  )

  async function handleDelete(id: string) {
    await deleteMutation.mutateAsync({ id })
    queryClient.invalidateQueries(trpc.equipment.getAll.queryOptions())
    setDeleteId(null)
  }

  function handleNew() {
    setEditingId(null)
    setMeta(emptyMeta())
    setItems([])
    setStep("step1")
  }

  function handleStep1Done(updatedMeta: EquipmentMeta, statementId: string) {
    setEditingId(statementId)
    setMeta(updatedMeta)
    setStep("step2")
  }

  function handleStep2Done() {
    setStep("list")
    queryClient.invalidateQueries(trpc.equipment.getAll.queryOptions())
  }

  function handlePrint(id: string) {
    setPrintId(id)
    setStep("print")
  }

  const formatLabel = (type: string) =>
    type === "H33" ? "INS-FORMAT-H33" : "INS-FORMAT-33"

  if (step === "step1") {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <button type="button" onClick={() => setStep("list")} className="hover:text-foreground transition-colors">
              Equipment
            </button>
            <span>/</span>
            <span className="text-foreground font-medium">New Statement</span>
          </div>
          <EquipmentStep1 meta={meta} onDone={handleStep1Done} onBack={() => setStep("list")} />
        </div>
      </div>
    )
  }

  if (step === "step2" && editingId) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <button type="button" onClick={() => setStep("list")} className="hover:text-foreground transition-colors">
              Equipment
            </button>
            <span>/</span>
            <button type="button" onClick={() => setStep("step1")} className="hover:text-foreground transition-colors">
              Details
            </button>
            <span>/</span>
            <span className="text-foreground font-medium">Equipment Items</span>
          </div>
          <EquipmentStep2
            statementId={editingId}
            meta={meta}
            items={items}
            setItems={setItems}
            onDone={handleStep2Done}
            onBack={() => setStep("step1")}
            onPrint={() => handlePrint(editingId)}
          />
        </div>
      </div>
    )
  }

  if (step === "print" && printId) {
    return <EquipmentPrint statementId={printId} onBack={() => setStep("list")} />
  }

  // ── LIST VIEW ──
  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-primary" />
              Lab / Workshop Equipment
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage INS-FORMAT-H33 and INS-FORMAT-33 equipment statements
            </p>
          </div>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" /> New Statement
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
        ) : statements && (statements as StatementRow[]).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(statements as StatementRow[]).map((s) => (
              <Card key={s.id} className="hover:shadow-md transition-shadow border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{s.institutionName ?? "—"}</CardTitle>
                      <CardDescription className="mt-0.5 text-xs">Code: {s.institutionCode ?? "—"}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {formatLabel(s.formatType)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="text-xs text-muted-foreground space-y-1">
                    {s.branchName && (
                      <p className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {s.branchName}
                        {s.departmentName && ` › ${s.departmentName}`}
                      </p>
                    )}
                    <p>Program: <span className="font-medium text-foreground">{s.program}</span></p>
                    <p>Semester: <span className="font-medium text-foreground">{s.semester}</span></p>
                    <p>Lab/Workshop: <span className="font-medium text-foreground">{s.labWorkshop}</span></p>
                    <p>Academic Year: <span className="font-medium text-foreground">{s.academicYear}</span></p>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => handlePrint(s.id)}>
                      <Printer className="h-3 w-3" /> Print
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => { setEditingId(s.id); setStep("step2") }}>
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FlaskConical className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold">No equipment statements yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              Create your first equipment statement to get started.
            </p>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="h-4 w-4" /> New Statement
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Statement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the equipment statement and all its items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteId) handleDelete(deleteId) }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}