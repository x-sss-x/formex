"use client"

import { useState } from "react"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import {
  Building2,
  GitBranch,
  Layers,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Institution = {
  id: string
  name: string
  code: string
  email?: string | null
  phone?: string | null
  logoUrl?: string | null
}

type Branch = {
  id: string
  name: string
  institutionId: string
}

type Department = {
  id: string
  name: string
  branchId: string
}

type DialogState =
  | { type: "none" }
  | { type: "add-institution" }
  | { type: "edit-institution"; item: Institution }
  | { type: "add-branch" }
  | { type: "edit-branch"; item: Branch }
  | { type: "add-department" }
  | { type: "edit-department"; item: Department }

type DeleteState =
  | { type: "none" }
  | { type: "institution"; id: string; name: string }
  | { type: "branch"; id: string; name: string }
  | { type: "department"; id: string; name: string }

export default function InstitutionsPage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [dialog, setDialog] = useState<DialogState>({ type: "none" })
  const [deleteState, setDeleteState] = useState<DeleteState>({ type: "none" })

  const [form, setForm] = useState({
    name: "", code: "", email: "", phone: "", logoUrl: "",
  })

  // ── Queries ──
  const { data: institutions, isLoading: loadingInst } = useQuery(
    trpc.institution.getAll.queryOptions()
  )
  const { data: branches, isLoading: loadingBranch } = useQuery(
    trpc.branch.getByInstitution.queryOptions(
      { institutionId: selectedInstitution?.id ?? "" },
      { enabled: !!selectedInstitution }
    )
  )
  const { data: departments, isLoading: loadingDept } = useQuery(
    trpc.department.getByBranch.queryOptions(
      { branchId: selectedBranch?.id ?? "" },
      { enabled: !!selectedBranch }
    )
  )

  // ── Mutations ──
  const createInstitution = useMutation(trpc.institution.create.mutationOptions({
    onSuccess: () => { invalidate("institution"); closeDialog() },
  }))
  const updateInstitution = useMutation(trpc.institution.update.mutationOptions({
    onSuccess: () => { invalidate("institution"); closeDialog() },
  }))
  const deleteInstitution = useMutation(trpc.institution.delete.mutationOptions({
    onSuccess: () => { invalidate("institution"); setSelectedInstitution(null); setSelectedBranch(null) },
  }))
  const createBranch = useMutation(trpc.branch.create.mutationOptions({
    onSuccess: () => { invalidate("branch"); closeDialog() },
  }))
  const updateBranch = useMutation(trpc.branch.update.mutationOptions({
    onSuccess: () => { invalidate("branch"); closeDialog() },
  }))
  const deleteBranch = useMutation(trpc.branch.delete.mutationOptions({
    onSuccess: () => { invalidate("branch"); setSelectedBranch(null) },
  }))
  const createDepartment = useMutation(trpc.department.create.mutationOptions({
    onSuccess: () => { invalidate("department"); closeDialog() },
  }))
  const updateDepartment = useMutation(trpc.department.update.mutationOptions({
    onSuccess: () => { invalidate("department"); closeDialog() },
  }))
  const deleteDepartment = useMutation(trpc.department.delete.mutationOptions({
    onSuccess: () => invalidate("department"),
  }))

  function invalidate(type: "institution" | "branch" | "department") {
    if (type === "institution") {
      queryClient.invalidateQueries(trpc.institution.getAll.queryOptions())
    } else if (type === "branch" && selectedInstitution) {
      queryClient.invalidateQueries(
        trpc.branch.getByInstitution.queryOptions({ institutionId: selectedInstitution.id })
      )
    } else if (type === "department" && selectedBranch) {
      queryClient.invalidateQueries(
        trpc.department.getByBranch.queryOptions({ branchId: selectedBranch.id })
      )
    }
  }

  function openAdd(type: "add-institution" | "add-branch" | "add-department") {
    setForm({ name: "", code: "", email: "", phone: "", logoUrl: "" })
    setDialog({ type })
  }

  function openEdit(
    type: "edit-institution" | "edit-branch" | "edit-department",
    item: Institution | Branch | Department
  ) {
    if (type === "edit-institution") {
      const inst = item as Institution
      setForm({ name: inst.name, code: inst.code, email: inst.email ?? "", phone: inst.phone ?? "", logoUrl: inst.logoUrl ?? "" })
      setDialog({ type, item: inst })
    } else if (type === "edit-branch") {
      const b = item as Branch
      setForm({ name: b.name, code: "", email: "", phone: "", logoUrl: "" })
      setDialog({ type, item: b })
    } else {
      const d = item as Department
      setForm({ name: d.name, code: "", email: "", phone: "", logoUrl: "" })
      setDialog({ type, item: d })
    }
  }

  function closeDialog() {
    setDialog({ type: "none" })
    setForm({ name: "", code: "", email: "", phone: "", logoUrl: "" })
  }

  async function handleSubmit() {
    if (dialog.type === "add-institution") {
      await createInstitution.mutateAsync({ name: form.name, code: form.code, email: form.email || null, phone: form.phone || null, logoUrl: form.logoUrl || null })
    } else if (dialog.type === "edit-institution") {
      await updateInstitution.mutateAsync({ id: dialog.item.id, name: form.name, code: form.code, email: form.email || null, phone: form.phone || null, logoUrl: form.logoUrl || null })
    } else if (dialog.type === "add-branch" && selectedInstitution) {
      await createBranch.mutateAsync({ name: form.name, institutionId: selectedInstitution.id })
    } else if (dialog.type === "edit-branch") {
      await updateBranch.mutateAsync({ id: dialog.item.id, name: form.name })
    } else if (dialog.type === "add-department" && selectedBranch) {
      await createDepartment.mutateAsync({ name: form.name, branchId: selectedBranch.id })
    } else if (dialog.type === "edit-department") {
      await updateDepartment.mutateAsync({ id: dialog.item.id, name: form.name })
    }
  }

  function handleDelete() {
    if (deleteState.type === "institution") deleteInstitution.mutate({ id: deleteState.id })
    else if (deleteState.type === "branch") deleteBranch.mutate({ id: deleteState.id })
    else if (deleteState.type === "department") deleteDepartment.mutate({ id: deleteState.id })
    setDeleteState({ type: "none" })
  }

  const isMutating =
    createInstitution.isPending || updateInstitution.isPending ||
    createBranch.isPending || updateBranch.isPending ||
    createDepartment.isPending || updateDepartment.isPending

  const dialogTitle = {
    "add-institution": "Add Institution",
    "edit-institution": "Edit Institution",
    "add-branch": "Add Branch",
    "edit-branch": "Edit Branch",
    "add-department": "Add Department",
    "edit-department": "Edit Department",
    "none": "",
  }[dialog.type]

  const isInstitutionDialog =
    dialog.type === "add-institution" || dialog.type === "edit-institution"

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Institution Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage institutions, branches and departments
          </p>
        </div>

        <Separator />

        {/* 3-Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Panel 1: Institutions ── */}
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Institutions
                  {institutions && (
                    <Badge variant="secondary" className="text-xs">{institutions.length}</Badge>
                  )}
                </CardTitle>
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => openAdd("add-institution")}>
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              {loadingInst ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : institutions && institutions.length > 0 ? (
                (institutions as Institution[]).map((inst) => (
                  <div key={inst.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedInstitution(inst); setSelectedBranch(null) }}
                      className={cn(
                        "flex-1 flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-colors group",
                        selectedInstitution?.id === inst.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/60 border border-transparent"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{inst.name}</p>
                        <p className="text-xs text-muted-foreground">{inst.code}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-2 shrink-0" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit("edit-institution", inst)}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteState({ type: "institution", id: inst.id, name: inst.name })}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No institutions yet.
                  <br />
                  <button
                    type="button"
                    onClick={() => openAdd("add-institution")}
                    className="text-primary hover:underline mt-1 inline-block"
                  >
                    Add one
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Panel 2: Branches ── */}
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  Branches
                  {branches && (
                    <Badge variant="secondary" className="text-xs">{branches.length}</Badge>
                  )}
                </CardTitle>
                {selectedInstitution && (
                  <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => openAdd("add-branch")}>
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                )}
              </div>
              {selectedInstitution && (
                <p className="text-xs text-muted-foreground mt-1">{selectedInstitution.name}</p>
              )}
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              {!selectedInstitution ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Select an institution to view branches
                </div>
              ) : loadingBranch ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : branches && branches.length > 0 ? (
                (branches as Branch[]).map((b) => (
                  <div key={b.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedBranch(b)}
                      className={cn(
                        "flex-1 flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-colors",
                        selectedBranch?.id === b.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/60 border border-transparent"
                      )}
                    >
                      <p className="text-sm font-medium truncate">{b.name}</p>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-2 shrink-0" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit("edit-branch", b)}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteState({ type: "branch", id: b.id, name: b.name })}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No branches yet.
                  <br />
                  <button
                    type="button"
                    onClick={() => openAdd("add-branch")}
                    className="text-primary hover:underline mt-1 inline-block"
                  >
                    Add one
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Panel 3: Departments ── */}
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Departments
                  {departments && (
                    <Badge variant="secondary" className="text-xs">{departments.length}</Badge>
                  )}
                </CardTitle>
                {selectedBranch && (
                  <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => openAdd("add-department")}>
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                )}
              </div>
              {selectedBranch && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedInstitution?.name} › {selectedBranch.name}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              {!selectedBranch ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Select a branch to view departments
                </div>
              ) : loadingDept ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : departments && departments.length > 0 ? (
                (departments as Department[]).map((d) => (
                  <div key={d.id} className="flex items-center gap-1">
                    <div className="flex-1 px-3 py-2.5 rounded-md border border-transparent">
                      <p className="text-sm font-medium truncate">{d.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEdit("edit-department", d)}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteState({ type: "department", id: d.id, name: d.name })}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No departments yet.
                  <br />
                  <button
                    type="button"
                    onClick={() => openAdd("add-department")}
                    className="text-primary hover:underline mt-1 inline-block"
                  >
                    Add one
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialog.type !== "none"} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Enter name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            {isInstitutionDialog && (
              <>
                <div className="space-y-2">
                  <Label>Code <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g. GVT-001"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="official@email.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      placeholder="+91 XXXXX XXXXX"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Logo URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input
                    placeholder="https://..."
                    value={form.logoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name || (isInstitutionDialog && !form.code) || isMutating}
            >
              {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={deleteState.type !== "none"} onOpenChange={() => setDeleteState({ type: "none" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteState.type !== "none" ? deleteState.type : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteState.type !== "none" && (
                <>
                  Are you sure you want to delete <strong>{deleteState.name}</strong>?
                  {deleteState.type === "institution" && " This will also delete all its branches and departments."}
                  {deleteState.type === "branch" && " This will also delete all its departments."}
                  {" "}This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}