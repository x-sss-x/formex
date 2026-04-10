"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Container from "@/components/container";
import { DataTable } from "@/components/data-table";
import Header from "@/components/header";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ensureSanctumCsrf } from "@/lib/api/csrf";
import { $api } from "@/lib/api/mutator";
import { type Faculty, getFacultyColumns } from "./columns";

const inviteFacultySchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email"),
});

type InviteFacultyValues = z.infer<typeof inviteFacultySchema>;

type FacultyApiRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  programs: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string }>;
};

export default function Page() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const queryClient = useQueryClient();

  const inviteForm = useForm<InviteFacultyValues>({
    resolver: zodResolver(inviteFacultySchema),
    defaultValues: { fullName: "", email: "" },
  });

  const facultyQuery = useQuery({
    queryKey: ["faculty-index"],
    queryFn: async (): Promise<Faculty[]> => {
      const response = await $api<{ data: FacultyApiRow[]; status: number }>(
        "/institutions/current/faculty",
        {
          method: "GET",
        },
      );

      if (response.status !== 200) {
        throw new Error("Unable to load faculty.");
      }

      return response.data.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        programs: row.programs ?? [],
        subjects: row.subjects ?? [],
      }));
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (values: InviteFacultyValues): Promise<void> => {
      await ensureSanctumCsrf();

      const response = await $api<{
        status: number;
        data?: { message?: string };
      }>("/institutions/current/faculty/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: values.fullName,
          email: values.email,
        }),
      });

      if (response.status !== 201) {
        throw new Error(
          response.data?.message ?? "Failed to send faculty invitation.",
        );
      }
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully.");
      setInviteOpen(false);
      inviteForm.reset();
      queryClient.invalidateQueries({ queryKey: ["faculty-index"] });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to send invitation.";
      toast.error(message);
    },
  });

  const columns = useMemo(() => getFacultyColumns(), []);
  const faculty = facultyQuery.data ?? [];

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbPage>Faculty</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>
      <Container>
        <div className="flex justify-between">
          <Dialog
            open={inviteOpen}
            onOpenChange={(open) => {
              setInviteOpen(open);
              if (!open) {
                inviteForm.reset();
              }
            }}
          >
            <Button onClick={() => setInviteOpen(true)}>
              Invite Faculty <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite faculty</DialogTitle>
                <DialogDescription>
                  Send an invite email with a secure signup link.
                </DialogDescription>
              </DialogHeader>
              <Form {...inviteForm}>
                <form
                  className="space-y-3"
                  onSubmit={inviteForm.handleSubmit((values) =>
                    inviteMutation.mutate(values),
                  )}
                >
                  <FormField
                    control={inviteForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={inviteForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setInviteOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={inviteMutation.isPending}>
                      {inviteMutation.isPending ? "Sending..." : "Send Invite"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable columns={columns} data={faculty} />
      </Container>
    </>
  );
}
