"use client";

import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useMemo } from "react";
import Container from "@/components/container";
import { DataTable } from "@/components/data-table";
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
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgramOutcomeListByProgram } from "@/lib/api/generated/program-outcome/program-outcome";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";
import { CreateProgramOutcomeSheet } from "./create-program-outcome-sheet";
import { getProgramOutcomeColumns } from "./columns";
import {
  PROGRAM_OUTCOME_TYPE_LABELS,
  PROGRAM_OUTCOME_TYPES,
} from "./program-outcome-form.helpers";

export function ProgramOutcomesByProgramPage() {
  const { programId } = useParams<{ programId: string }>();
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ limitUrlUpdates: throttle(300) }),
  );
  const [selectedType, setSelectedType] = useQueryState(
    "type",
    parseAsString
      .withDefault("program_outcome")
      .withOptions({ limitUrlUpdates: throttle(300) }),
  );

  const { data: program } = useProgramsShow(programId);
  const outcomesQuery = useProgramOutcomeListByProgram(programId, {
    query: { enabled: !!programId },
  });
  const rows = outcomesQuery.data?.status === 200 ? outcomesQuery.data.data.data : [];
  const activeType = PROGRAM_OUTCOME_TYPES.includes(
    selectedType as (typeof PROGRAM_OUTCOME_TYPES)[number],
  )
    ? (selectedType as (typeof PROGRAM_OUTCOME_TYPES)[number])
    : "program_outcome";

  const visibleRows = useMemo(() => {
    const typeFilteredRows = rows.filter((entry) => entry.type === activeType);
    const q = search.trim().toLowerCase();
    if (!q) {
      return typeFilteredRows;
    }
    return typeFilteredRows.filter((entry) => {
      return [entry.name ?? "", entry.description ?? "", entry.syllabus_scheme ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [activeType, rows, search]);

  const columns = useMemo(() => getProgramOutcomeColumns(), []);

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
              <BreadcrumbPage>Program Outcome</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InputGroup className="max-w-sm min-w-[200px]">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search program outcomes..."
              value={search}
              onChange={(e) => void setSearch(e.target.value || null)}
            />
          </InputGroup>
          <CreateProgramOutcomeSheet programId={programId}>
            <Button>
              Add <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
          </CreateProgramOutcomeSheet>
        </div>
        <Tabs
          value={activeType}
          onValueChange={(value) => void setSelectedType(value)}
          className="mt-3"
        >
          <TabsList variant="line" className="w-full justify-start overflow-x-auto">
            {PROGRAM_OUTCOME_TYPES.map((type) => (
              <TabsTrigger key={type} value={type}>
                {PROGRAM_OUTCOME_TYPE_LABELS[type]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {outcomesQuery.isLoading ? (
          <SpinnerPage />
        ) : (
          <DataTable data={visibleRows} columns={columns} />
        )}
      </Container>
    </>
  );
}
