"use client";

import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useMemo } from "react";
import Container from "@/components/container";
import { CreateCoursePlanSheet } from "@/components/course-plans/create-course-plan-sheet";
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
import { useCoursePlansList } from "@/lib/api/hooks/useCoursePlansList";
import { getCoursePlanColumns } from "./columns";

export function CoursePlansPage() {
  const { coursePlans, coursePlansQuery } = useCoursePlansList();
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ limitUrlUpdates: throttle(300) }),
  );

  const rows = coursePlans ?? [];
  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((entry) => {
      return [
        entry.course?.name ?? "",
        entry.course?.short_name ?? "",
        entry.course_coordinator?.name ?? "",
        entry.week_no ?? "",
        entry.topic_no ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, search]);

  const columns = useMemo(() => getCoursePlanColumns(), []);

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
              <BreadcrumbPage>Course Plans</BreadcrumbPage>
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
              placeholder="Search course plans..."
              value={search}
              onChange={(e) => void setSearch(e.target.value || null)}
            />
          </InputGroup>
          <CreateCoursePlanSheet>
            <Button>
              Add <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
          </CreateCoursePlanSheet>
        </div>
        {coursePlansQuery.isLoading ? (
          <SpinnerPage />
        ) : (
          <DataTable data={visibleRows} columns={columns} />
        )}
      </Container>
    </>
  );
}
