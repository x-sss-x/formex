"use client";

import {
  Book01Icon,
  DashboardCircleIcon,
  GridIcon,
  Mortarboard01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { getTemplatePagesByType } from "../tempalate-pages";
import { Button } from "../ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { NewSubjectDialog } from "../dialogs/new-subject.dialog";
import { SubjectActions } from "./subject-actions";

const items = {
  semester: [
    { id: 1, label: "Dashboard", icon: DashboardCircleIcon, href: "" },
    { id: 2, label: "Students", icon: Mortarboard01Icon, href: "/students" },
  ],
  subjects: [
    { id: "1", label: "Applied Science", icon: Book01Icon },
    { id: "2", label: "Mathemetics", icon: Book01Icon },
    { id: "3", label: "Network Security", icon: Book01Icon },
  ],
};

const semesters = [
  {
    id: 1,
    label: "SEM-1",
  },
  {
    id: 2,
    label: "SEM-2",
  },
  {
    id: 3,
    label: "SEM-3",
  },
  {
    id: 4,
    label: "SEM-4",
  },
];

const branchFormats = getTemplatePagesByType("branch");

export function ProgramSidebar() {
  const { programId } = useParams<{ programId: string }>();
  const pathname = usePathname();
  const activeSemesterId = 1;
  const [subjects, setSubjects] = useState(items.subjects);

  if (!programId) return null;

  return (
    <Sidebar collapsible="none" className="peer flex-1 flex">
      <SidebarHeader className="justify-center h-14">
        <span className="text-sm px-1.5 font-semibold">
          Computer Science & Engg.
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="grid gap-1.5 grid-cols-4">
            {semesters.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={activeSemesterId === item.id}
                  size={"sm"}
                  asChild
                >
                  <Button
                    variant={activeSemesterId === item.id ? "outline" : "ghost"}
                    className="font-mono bg-transparent"
                  >
                    {item.label}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>SEMESTER</SidebarGroupLabel>
          <SidebarMenu>
            {items.semester.map((item) => (
              <SidebarMenuItem key={item.id}>
                <Link href={`/p/${programId}${item.href}`}>
                  <SidebarMenuButton
                    isActive={pathname === `/p/${programId}${item.href}`}
                  >
                    <HugeiconsIcon icon={item.icon} /> {item.label}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            SUBJECTS
            <NewSubjectDialog
              trigger={
                <SidebarGroupAction>
                  <HugeiconsIcon icon={PlusSignIcon} />
                </SidebarGroupAction>
              }
              onCreated={({ name }) => {
                setSubjects((prev) => [
                  { id: crypto.randomUUID(), label: name, icon: Book01Icon },
                  ...prev,
                ]);
              }}
            />
          </SidebarGroupLabel>
          <SidebarMenu>
            {subjects.map((item) => (
              <SidebarMenuItem key={item.id}>
                <div className="flex items-center gap-2">
                  <Link className="flex-1" href={`/p/${programId}/s/${item.id}`}>
                    <SidebarMenuButton
                      isActive={pathname === `/p/${programId}/s/${item.id}`}
                      className="w-full justify-start"
                    >
                      <HugeiconsIcon icon={item.icon} /> {item.label}
                    </SidebarMenuButton>
                  </Link>
                  <SubjectActions
                    id={item.id}
                    name={item.label}
                    onRename={(nextName) =>
                      setSubjects((prev) =>
                        prev.map((s) =>
                          s.id === item.id ? { ...s, label: nextName } : s,
                        ),
                      )
                    }
                    onDelete={() =>
                      setSubjects((prev) => prev.filter((s) => s.id !== item.id))
                    }
                  />
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>SEMESTER FORMATS</SidebarGroupLabel>
          <SidebarMenu>
            {branchFormats.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton isActive={pathname === `/f/${item.slug}`}>
                  <HugeiconsIcon icon={GridIcon} /> {item.name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>PROGRAM FORMATS</SidebarGroupLabel>
          <SidebarMenu>
            {branchFormats.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton isActive={pathname === `/f/${item.slug}`}>
                  <HugeiconsIcon icon={GridIcon} /> {item.name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
