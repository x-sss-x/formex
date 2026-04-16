"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Container from "@/components/container";
import Header from "@/components/header";
import { SpinnerPage } from "@/components/spinner-page";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/api/hooks/useSession";
import { useProgramMasterTimetable } from "@/lib/api/hooks/useTimetable";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";
import { hasAnyRole } from "@/lib/auth/roles";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const HOURS = [1, 2, 3, 4, 5, 6, 7] as const;
const SEMESTERS_BY_PARITY = {
  odd: [1, 3, 5],
  even: [2, 4, 6],
} as const;
const ROMAN_BY_SEMESTER: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
};

type SemesterParity = keyof typeof SEMESTERS_BY_PARITY;

function isTimetableSlot(
  slot: unknown,
): slot is { start_hour_no: number; end_hour_no: number; day: string } {
  if (typeof slot !== "object" || slot === null) {
    return false;
  }

  const maybeSlot = slot as {
    start_hour_no?: unknown;
    end_hour_no?: unknown;
    day?: unknown;
  };

  return (
    typeof maybeSlot.start_hour_no === "number" &&
    typeof maybeSlot.end_hour_no === "number" &&
    typeof maybeSlot.day === "string"
  );
}

function parseParity(value: string | null): SemesterParity {
  return value === "even" ? "even" : "odd";
}

function dayShortLabel(day: string): string {
  return day.slice(0, 3).toUpperCase();
}

export function MasterTimetablePage() {
  const { programId } = useParams<{ programId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const role = session?.current_institution_role;
  const canViewMasterTimetable = hasAnyRole(role, [
    "principal",
    "program_coordinator",
  ]);
  const selectedParity = parseParity(searchParams.get("term"));
  const semesters = SEMESTERS_BY_PARITY[selectedParity];
  const { data: program } = useProgramsShow(programId);

  const timetableQueries = useProgramMasterTimetable(
    programId,
    semesters,
    canViewMasterTimetable,
  );

  const isLoading =
    canViewMasterTimetable && timetableQueries.some((query) => query.isLoading);
  const hasError =
    canViewMasterTimetable && timetableQueries.some((query) => query.isError);

  const occupiedSlots = useMemo(() => {
    const map: Record<string, true> = {};

    semesters.forEach((semester, index) => {
      const data = timetableQueries[index]?.data;
      if (!data) {
        return;
      }

      data.slots.forEach((slot) => {
        if (!isTimetableSlot(slot)) {
          return;
        }

        for (let hour = slot.start_hour_no; hour <= slot.end_hour_no; hour += 1) {
          map[`${semester}|${slot.day}|${hour}`] = true;
        }
      });
    });

    return map;
  }, [semesters, timetableQueries]);

  const onParityChange = (value: string) => {
    if (value !== "odd" && value !== "even") {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("term", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const totalBodyRows = DAYS.length * semesters.length;

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
            {programId ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/p/${programId}`}>
                      {program?.name ?? "Program"}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Master Timetable</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Container className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Master Timetable</h1>
          <p className="text-muted-foreground text-sm">
            View the semester-wise program timetable in a single sheet.
          </p>
        </div>

        {canViewMasterTimetable ? (
          <>
            <Tabs value={selectedParity} onValueChange={onParityChange}>
              <TabsList>
                <TabsTrigger value="odd">Odd Semesters (I, III, V)</TabsTrigger>
                <TabsTrigger value="even">Even Semesters (II, IV, VI)</TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <SpinnerPage />
            ) : hasError ? (
              <p className="text-sm text-destructive">
                Could not load master timetable data.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table className="w-full table-fixed border-collapse">
                  <TableHeader>
                    <TableRow>
                      <TableHead rowSpan={2} className="w-20 border text-center">
                        Day
                      </TableHead>
                      <TableHead rowSpan={2} className="w-36 border text-center">
                        Class
                      </TableHead>
                      <TableHead className="w-20 border text-center">Period</TableHead>
                      <TableHead rowSpan={2} className="w-12 border text-center">
                        1
                      </TableHead>
                      <TableHead rowSpan={2} className="w-12 border text-center">
                        2
                      </TableHead>
                      <TableHead rowSpan={2} className="w-12 border text-center">
                        3
                      </TableHead>
                      <TableHead rowSpan={2} className="w-12 border text-center">
                        4
                      </TableHead>
                      <TableHead rowSpan={2} className="w-14 border text-center"></TableHead>
                      <TableHead rowSpan={2} className="w-12 border text-center">
                        5
                      </TableHead>
                      <TableHead rowSpan={2} className="w-12 border text-center">
                        6
                      </TableHead>
                      <TableHead rowSpan={2} className="w-12 border text-center">
                        7
                      </TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead className="border text-center">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DAYS.flatMap((day) =>
                      semesters.map((semester, semesterIndex) => (
                        <TableRow key={`${day}-${semester}`}>
                          {semesterIndex === 0 ? (
                            <TableCell
                              rowSpan={semesters.length}
                              className="border text-center align-middle font-semibold"
                            >
                              {dayShortLabel(day)}
                            </TableCell>
                          ) : null}

                          <TableCell className="border text-center align-middle">
                            {ROMAN_BY_SEMESTER[semester]} Semester
                          </TableCell>
                          <TableCell className="border text-center align-middle">
                            {" "}
                          </TableCell>

                          {HOURS.slice(0, 4).map((hour) => (
                            <TableCell
                              key={`${day}-${semester}-${hour}`}
                              className="border text-center align-middle"
                            >
                              {occupiedSlots[`${semester}|${day}|${hour}`] ? "X" : ""}
                            </TableCell>
                          ))}

                          {day === "Monday" && semesterIndex === 0 ? (
                            <TableCell
                              rowSpan={totalBodyRows}
                              className="border text-center align-middle"
                            >
                              Break
                            </TableCell>
                          ) : null}

                          {HOURS.slice(4).map((hour) => (
                            <TableCell
                              key={`${day}-${semester}-${hour}`}
                              className="border text-center align-middle"
                            >
                              {occupiedSlots[`${semester}|${day}|${hour}`] ? "X" : ""}
                            </TableCell>
                          ))}
                        </TableRow>
                      )),
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-destructive">
            You are not allowed to access the master timetable.
          </p>
        )}
      </Container>
    </>
  );
}
