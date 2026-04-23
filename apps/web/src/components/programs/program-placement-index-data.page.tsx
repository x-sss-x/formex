"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Container from "@/components/container";
import Header from "@/components/header";
import { SpinnerPage } from "@/components/spinner-page";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthUser } from "@/lib/api/generated/auth/auth";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";
import { $api } from "@/lib/api/mutator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type PlacementIndexRow = {
  academic_year: number;
  total_students_count: number;
  placed_count: number;
  higher_studies_count: number;
  entrepreneur_count: number;
  weighted_total: number;
  placement_index: number;
};

type ProgramPlacementIndexRowsResponse = {
  data: {
    data: PlacementIndexRow[];
  };
  status: number;
  headers: Headers;
};

type ProgramPlacementIndexResponse = {
  data: {
    data: {
      program_id: string;
      lyg: PlacementIndexRow;
      lyg_m1: PlacementIndexRow;
      lyg_m2: PlacementIndexRow;
      average_placement_index: number;
    };
  };
  status: number;
  headers: Headers;
};

function toCount(raw: string): number {
  const next = Number(raw);
  if (!Number.isFinite(next) || next < 0) {
    return 0;
  }
  return Math.floor(next);
}

function formatIndex(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

export function ProgramPlacementIndexDataPage() {
  const queryClient = useQueryClient();
  const { programId } = useParams<{ programId: string }>();
  const { data: auth } = useAuthUser();
  const { data: program } = useProgramsShow(programId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [yearInput, setYearInput] = useState("");
  const [totalInput, setTotalInput] = useState("");
  const [placedInput, setPlacedInput] = useState("");
  const [higherStudiesInput, setHigherStudiesInput] = useState("");
  const [entrepreneurInput, setEntrepreneurInput] = useState("");

  const currentAcademicYear =
    auth?.status === 200 && auth.data.current_academic_year != null
      ? auth.data.current_academic_year
      : new Date().getFullYear();

  const rowsQ = useQuery({
    queryKey: ["program-placement-index-rows", programId],
    queryFn: async () => {
      return $api<ProgramPlacementIndexRowsResponse>(
        `/programs/${programId}/placement-index-rows`,
      );
    },
    enabled: !!programId,
  });

  const rows = rowsQ.data?.status === 200 ? rowsQ.data.data.data : [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      return $api<ProgramPlacementIndexResponse>(`/programs/${programId}/placement-index`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: [
            {
              academic_year: Number(yearInput),
              total_students_count: toCount(totalInput),
              placed_count: toCount(placedInput),
              higher_studies_count: toCount(higherStudiesInput),
              entrepreneur_count: toCount(entrepreneurInput),
            },
          ],
        }),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["program-placement-index-rows", programId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["program-placement-index", programId],
      });
      toast.success(
        editingYear == null
          ? "Placement index data added"
          : "Placement index data updated",
      );
      setIsDialogOpen(false);
      setEditingYear(null);
    },
    onError: () => {
      toast.error("Could not save placement index data");
    },
  });

  const dialogErrors = useMemo(() => {
    const academicYear = Number(yearInput);
    const total = toCount(totalInput);
    const placed = toCount(placedInput);
    const higher = toCount(higherStudiesInput);
    const entrepreneur = toCount(entrepreneurInput);
    const errors: string[] = [];
    if (!Number.isInteger(academicYear) || academicYear < 1900 || academicYear > 9999) {
      errors.push("Academic year must be between 1900 and 9999.");
    }
    if ((placed + higher + entrepreneur) > total) {
      errors.push("X + Y + Z cannot exceed total students (N).");
    }
    return errors;
  }, [yearInput, totalInput, placedInput, higherStudiesInput, entrepreneurInput]);

  const openAddDialog = () => {
    setEditingYear(null);
    setYearInput(String(currentAcademicYear));
    setTotalInput("0");
    setPlacedInput("0");
    setHigherStudiesInput("0");
    setEntrepreneurInput("0");
    setIsDialogOpen(true);
  };

  const openEditDialog = (row: PlacementIndexRow) => {
    setEditingYear(row.academic_year);
    setYearInput(String(row.academic_year));
    setTotalInput(String(row.total_students_count));
    setPlacedInput(String(row.placed_count));
    setHigherStudiesInput(String(row.higher_studies_count));
    setEntrepreneurInput(String(row.entrepreneur_count));
    setIsDialogOpen(true);
  };

  if (rowsQ.isLoading) {
    return <SpinnerPage />;
  }

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/p/${programId}`}>{program?.name ?? "Program"}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Placement Index Data</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Container>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Manage year-wise values for placement index.
            </p>
            <Button onClick={openAddDialog}>Add Academic Year Data</Button>
          </div>

          <div className="overflow-hidden rounded-md border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-3 text-left font-semibold">Academic Year</th>
                  <th className="border p-3 text-center font-semibold">N</th>
                  <th className="border p-3 text-center font-semibold">X</th>
                  <th className="border p-3 text-center font-semibold">Y</th>
                  <th className="border p-3 text-center font-semibold">Z</th>
                  <th className="border p-3 text-center font-semibold">1.25X+Y+Z</th>
                  <th className="border p-3 text-center font-semibold">P</th>
                  <th className="border p-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="border p-3 text-center text-muted-foreground" colSpan={8}>
                      No data added yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.academic_year}>
                      <td className="border p-3">{row.academic_year}</td>
                      <td className="border p-3 text-center">{row.total_students_count}</td>
                      <td className="border p-3 text-center">{row.placed_count}</td>
                      <td className="border p-3 text-center">{row.higher_studies_count}</td>
                      <td className="border p-3 text-center">{row.entrepreneur_count}</td>
                      <td className="border p-3 text-center">{formatIndex(row.weighted_total)}</td>
                      <td className="border p-3 text-center">{formatIndex(row.placement_index)}</td>
                      <td className="border p-3 text-center">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(row)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Container>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingYear == null ? "Add placement index data" : "Edit placement index data"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="pi-year">
                Academic year
              </label>
              <Input id="pi-year" type="number" min={1900} max={9999} value={yearInput} onChange={(e) => setYearInput(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="pi-n">Total final year students (N)</label>
              <Input id="pi-n" type="number" min={0} value={totalInput} onChange={(e) => setTotalInput(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="pi-x">Placed students (X)</label>
              <Input id="pi-x" type="number" min={0} value={placedInput} onChange={(e) => setPlacedInput(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="pi-y">Higher studies (Y)</label>
              <Input id="pi-y" type="number" min={0} value={higherStudiesInput} onChange={(e) => setHigherStudiesInput(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="pi-z">Entrepreneur (Z)</label>
              <Input id="pi-z" type="number" min={0} value={entrepreneurInput} onChange={(e) => setEntrepreneurInput(e.target.value)} />
            </div>
            {dialogErrors.length > 0 ? (
              <div className="space-y-1">
                {dialogErrors.map((error) => (
                  <p key={error} className="text-sm text-destructive">{error}</p>
                ))}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={() => void saveMutation.mutateAsync()} disabled={dialogErrors.length > 0 || saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
