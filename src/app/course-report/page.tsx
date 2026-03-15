"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { ArrowLeft, Edit, Loader2, MoreVertical, Plus, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type ReportForm = {
  institutionName: string; institutionCode: string; academicYear: string;
  programName: string; semester: string; month: string;
  slNo: string; courseCoordinatorName: string; courseTaken: string;
  sessionsAsPerSyllabus: string; sessionsTaken: string;
  sessionsToBeTaken: string; percentageCovered: string;
};

const emptyForm = (): ReportForm => ({
  institutionName: "", institutionCode: "", academicYear: "", programName: "",
  semester: "", month: "", slNo: "", courseCoordinatorName: "", courseTaken: "",
  sessionsAsPerSyllabus: "", sessionsTaken: "", sessionsToBeTaken: "", percentageCovered: "",
});

const parseForm = (f: ReportForm) => ({
  institutionName: f.institutionName, institutionCode: f.institutionCode,
  academicYear: f.academicYear, programName: f.programName,
  semester: f.semester, month: f.month, slNo: Number(f.slNo),
  courseCoordinatorName: f.courseCoordinatorName, courseTaken: f.courseTaken,
  sessionsAsPerSyllabus: Number(f.sessionsAsPerSyllabus),
  sessionsTaken: Number(f.sessionsTaken),
  sessionsToBeTaken: Number(f.sessionsToBeTaken),
  percentageCovered: f.percentageCovered,
});

// Auto-calculate percentage when sessions change
const calcPercentage = (taken: string, total: string) => {
  const t = Number(taken); const s = Number(total);
  if (!s || s === 0) return "";
  return ((t / s) * 100).toFixed(2);
};

function FormFields({ form, setForm }: { form: ReportForm; setForm: (f: ReportForm) => void }) {
  const s = (k: keyof ReportForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...form, [k]: e.target.value };
    // Auto-calculate percentage when sessions change
    if (k === "sessionsTaken" || k === "sessionsAsPerSyllabus") {
      updated.percentageCovered = calcPercentage(
        k === "sessionsTaken" ? e.target.value : form.sessionsTaken,
        k === "sessionsAsPerSyllabus" ? e.target.value : form.sessionsAsPerSyllabus,
      );
      updated.sessionsToBeTaken = String(
        Math.max(0, Number(k === "sessionsAsPerSyllabus" ? e.target.value : form.sessionsAsPerSyllabus) - Number(k === "sessionsTaken" ? e.target.value : form.sessionsTaken))
      );
    }
    setForm(updated);
  };

  return (
    <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5"><Label>Institution Name</Label><Input value={form.institutionName} onChange={s("institutionName")} /></div>
        <div className="grid gap-1.5"><Label>Institution Code</Label><Input value={form.institutionCode} onChange={s("institutionCode")} /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-1.5"><Label>Academic Year</Label><Input placeholder="2024-25" value={form.academicYear} onChange={s("academicYear")} /></div>
        <div className="grid gap-1.5"><Label>Semester</Label><Input placeholder="III" value={form.semester} onChange={s("semester")} /></div>
        <div className="grid gap-1.5"><Label>Month</Label><Input placeholder="June 2024" value={form.month} onChange={s("month")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5"><Label>Name of Program</Label><Input value={form.programName} onChange={s("programName")} /></div>
        <div className="grid gap-1.5"><Label>Sl No</Label><Input type="number" value={form.slNo} onChange={s("slNo")} /></div>
      </div>
      <div className="border-t pt-2"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Course Coordinator Entry</p></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5"><Label>Name of Course Coordinator</Label><Input value={form.courseCoordinatorName} onChange={s("courseCoordinatorName")} /></div>
        <div className="grid gap-1.5"><Label>Course Taken</Label><Input value={form.courseTaken} onChange={s("courseTaken")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5"><Label>Sessions as per Syllabus</Label><Input type="number" value={form.sessionsAsPerSyllabus} onChange={s("sessionsAsPerSyllabus")} /></div>
        <div className="grid gap-1.5"><Label>No of Sessions Taken</Label><Input type="number" value={form.sessionsTaken} onChange={s("sessionsTaken")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Sessions to be Taken</Label>
          <Input type="number" value={form.sessionsToBeTaken} onChange={s("sessionsToBeTaken")}
            className="bg-muted/50" placeholder="Auto-calculated" />
        </div>
        <div className="grid gap-1.5">
          <Label>% of Concepts Covered</Label>
          <Input value={form.percentageCovered} onChange={s("percentageCovered")}
            placeholder="Auto-calculated" className="bg-muted/50" />
        </div>
      </div>
    </div>
  );
}

export default function CourseReportsPage() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data: reports = [], isLoading } = useQuery(trpc.courseReport.list.queryOptions());

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<ReportForm>(emptyForm());
  const [editForm, setEditForm] = useState<ReportForm>(emptyForm());

  const invalidate = () => qc.invalidateQueries(trpc.courseReport.list.queryOptions());

  const createMutation = useMutation(trpc.courseReport.create.mutationOptions({
    onSuccess: () => { toast.success("Report created"); void invalidate(); setIsAddOpen(false); setAddForm(emptyForm()); },
    onError: (e) => toast.error(e.message),
  }));

  const updateMutation = useMutation(trpc.courseReport.update.mutationOptions({
    onSuccess: () => { toast.success("Report updated"); void invalidate(); setEditingId(null); },
    onError: (e) => toast.error(e.message),
  }));

  const deleteMutation = useMutation(trpc.courseReport.delete.mutationOptions({
    onSuccess: () => { toast.success("Report deleted"); void invalidate(); },
    onError: (e) => toast.error(e.message),
  }));

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <main className="flex flex-col min-h-screen w-full bg-muted/40">
      <header className="sticky top-0 z-30 h-14 border-b bg-background/80 backdrop-blur px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm"><Link href="/"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Monthly Course Coordinator Reports</h1>
            <p className="text-xs text-muted-foreground">Epic 11 · Concepts covered per month</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild><Link href="/course-reports/print"><Printer className="mr-2 h-4 w-4" />Report</Link></Button>
          <Button size="sm" onClick={() => setIsAddOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Entry</Button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 md:px-8">
        <div className="rounded-md border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sl No</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead>Course Taken</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Sessions (Syllabus)</TableHead>
                <TableHead>Sessions Taken</TableHead>
                <TableHead>Sessions Pending</TableHead>
                <TableHead>% Covered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-10">No reports yet.</TableCell></TableRow>
              )}
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.slNo}</TableCell>
                  <TableCell className="font-medium">{r.courseCoordinatorName}</TableCell>
                  <TableCell>{r.courseTaken}</TableCell>
                  <TableCell>{r.month}</TableCell>
                  <TableCell>{r.semester}</TableCell>
                  <TableCell>{r.sessionsAsPerSyllabus}</TableCell>
                  <TableCell>{r.sessionsTaken}</TableCell>
                  <TableCell>{r.sessionsToBeTaken}</TableCell>
                  <TableCell>
                    <span className={Number(r.percentageCovered) >= 75 ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                      {Number(r.percentageCovered).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditForm({ institutionName: r.institutionName, institutionCode: r.institutionCode, academicYear: r.academicYear, programName: r.programName, semester: r.semester, month: r.month, slNo: String(r.slNo), courseCoordinatorName: r.courseCoordinatorName, courseTaken: r.courseTaken, sessionsAsPerSyllabus: String(r.sessionsAsPerSyllabus), sessionsTaken: String(r.sessionsTaken), sessionsToBeTaken: String(r.sessionsToBeTaken), percentageCovered: String(r.percentageCovered) });
                          setEditingId(r.id);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => { if (confirm("Delete this report?")) deleteMutation.mutate({ id: r.id }); }}>
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(o) => { setIsAddOpen(o); if (!o) setAddForm(emptyForm()); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Create Monthly Report</DialogTitle><DialogDescription>Epic 11 · Course coordinator monthly entry.</DialogDescription></DialogHeader>
          <FormFields form={addForm} setForm={setAddForm} />
          <DialogFooter>
            <Button disabled={createMutation.isPending || !addForm.courseCoordinatorName || !addForm.month} onClick={() => createMutation.mutate(parseForm(addForm))}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(o) => { if (!o) setEditingId(null); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Edit Monthly Report</DialogTitle></DialogHeader>
          <FormFields form={editForm} setForm={setEditForm} />
          <DialogFooter>
            <Button disabled={updateMutation.isPending || !editForm.courseCoordinatorName} onClick={() => { if (!editingId) return; updateMutation.mutate({ id: editingId, ...parseForm(editForm) }); }}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
