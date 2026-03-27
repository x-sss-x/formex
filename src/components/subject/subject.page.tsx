import Container from "@/components/container";
import Header from "@/components/header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const subjectMockById: Record<string, { name: string; subjectCode: string }> = {
  "1": { name: "Applied Science", subjectCode: "AS101" },
  "2": { name: "Mathematics", subjectCode: "MA102" },
  "3": { name: "Network Security", subjectCode: "NS201" },
};

export function SubjectPage({ subjectId }: { subjectId: string }) {
  const subject = subjectMockById[subjectId] ?? {
    name: "Unknown subject",
    subjectCode: `SUB-${subjectId}`,
  };

  const marksRows = [
    {
      id: "s1",
      rollNumber: "001",
      studentName: "Arjun Reddy",
      theory: 18,
      practical: 16,
    },
    {
      id: "s2",
      rollNumber: "002",
      studentName: "Sneha Sharma",
      theory: 20,
      practical: 15,
    },
    {
      id: "s3",
      rollNumber: "003",
      studentName: "Rahul Verma",
      theory: 17,
      practical: 17,
    },
  ];

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Program</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>{subject.subjectCode}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Container className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{subject.name}</h1>
            <p className="text-sm text-muted-foreground">
              Code: {subject.subjectCode}
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="marks">Marks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Subject name
                  </span>
                  <div className="font-medium">{subject.name}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Subject code
                  </span>
                  <div className="font-medium">{subject.subjectCode}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marks">
            <Card>
              <CardHeader>
                <CardTitle>Marks</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Theory</TableHead>
                      <TableHead>Practical</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marksRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.rollNumber}</TableCell>
                        <TableCell>{row.studentName}</TableCell>
                        <TableCell>{row.theory}</TableCell>
                        <TableCell>{row.practical}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </>
  );
}
