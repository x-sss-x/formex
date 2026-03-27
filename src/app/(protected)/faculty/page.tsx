import Header from "@/components/header";
import { columns, Faculty } from "./columns";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Container from "@/components/container";
import { DataTable } from "@/components/data-table";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

const facultyList: Faculty[] = [
  {
    id: "1",
    name: "Dr. Rajesh Kumar",
    email: "rajesh@example.com",
    role: "hod",
    createdAt: "2026-01-05T09:00:00Z",
  },
  {
    id: "2",
    name: "Anita Sharma",
    email: "anita@example.com",
    role: "staff",
    createdAt: "2026-01-08T11:30:00Z",
  },
  {
    id: "3",
    name: "Vikram Reddy",
    email: "vikram@example.com",
    role: "staff",
    createdAt: "2026-01-12T14:20:00Z",
  },
  {
    id: "4",
    name: "Dr. Meena Iyer",
    email: "meena@example.com",
    role: "hod",
    createdAt: "2026-01-15T10:10:00Z",
  },
];

export default function Page() {
  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbPage>Faculty</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>
      <Container className="space-y-4">
        <div className="flex justify-between">
          <InputGroup className="max-w-sm">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search..." />
          </InputGroup>
          <Button>
            Add <HugeiconsIcon icon={PlusSignIcon} />
          </Button>
        </div>
        <DataTable columns={columns} data={facultyList} />
      </Container>
    </>
  );
}
