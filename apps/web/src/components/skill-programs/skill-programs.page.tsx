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
import { CreateSkillProgramSheet } from "@/components/skill-programs/create-skill-program-sheet";
import { getSkillProgramColumns } from "@/components/skill-programs/columns";
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
import { useSkillProgramListByProgram } from "@/lib/api/generated/skill-program/skill-program";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";

export function SkillProgramsPage() {
  const { programId } = useParams<{ programId: string }>();
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      limitUrlUpdates: throttle(300),
    }),
  );

  const { data: program } = useProgramsShow(programId);
  const skillProgramsQuery = useSkillProgramListByProgram(programId, {
    query: { enabled: !!programId },
  });

  const rows =
    skillProgramsQuery.data?.status === 200 ? skillProgramsQuery.data.data.data : [];

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return rows;
    }

    return rows.filter((row) => {
      const haystack = [
        row.details,
        row.resource_person_name,
        row.company_name,
        row.designation,
        row.student?.full_name ?? "",
        row.student?.register_no ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [rows, search]);

  const columns = useMemo(() => getSkillProgramColumns(), []);

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
              <BreadcrumbPage>Skill Programs</BreadcrumbPage>
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
              placeholder="Search skill programs..."
              value={search}
              onChange={(e) => void setSearch(e.target.value || null)}
            />
          </InputGroup>
          <CreateSkillProgramSheet programId={programId}>
            <Button>
              Add <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
          </CreateSkillProgramSheet>
        </div>

        {skillProgramsQuery.isLoading ? (
          <SpinnerPage />
        ) : (
          <DataTable columns={columns} data={visibleRows} />
        )}
      </Container>
    </>
  );
}
