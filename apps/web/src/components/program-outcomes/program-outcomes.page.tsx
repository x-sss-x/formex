"use client";

import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
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
import { CreateProgramOutcomeSheet } from "./create-program-outcome-sheet";
import { getProgramOutcomeColumns } from "./columns";
import { useProgramOutcomesList } from "@/lib/api/hooks/useProgramOutcomesList";

export function ProgramOutcomesPage() {
  const { programOutcomes, programOutcomesQuery } = useProgramOutcomesList();
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ limitUrlUpdates: throttle(300) }),
  );

  const rows = programOutcomes ?? [];
  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((entry) => {
      return [
        entry.name ?? "",
        entry.description ?? "",
        entry.syllabus_scheme ?? "",
        entry.program?.name ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, search]);

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
              <BreadcrumbPage>Program Outcomes</BreadcrumbPage>
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
          <CreateProgramOutcomeSheet>
            <Button>
              Add <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
          </CreateProgramOutcomeSheet>
        </div>
        {programOutcomesQuery.isLoading ? (
          <SpinnerPage />
        ) : (
          <DataTable data={visibleRows} columns={columns} />
        )}
      </Container>
    </>
  );
}
