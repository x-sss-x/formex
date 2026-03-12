"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function TestPage() {
  const trpc = useTRPC();

  const calendars = useQuery(trpc.calendar.getAll.queryOptions());

  const createCalendar = useMutation(
    trpc.calendar.create.mutationOptions()
  );

  const updateCalendar = useMutation(
    trpc.calendar.update.mutationOptions()
  );

  const deleteCalendar = useMutation(
    trpc.calendar.delete.mutationOptions()
  );

  const handleCreate = () => {
    createCalendar.mutate({
      institutionId: "550e8400-e29b-41d4-a716-446655440000",
      branchId: null,
      departmentId: null,
      academicYear: "2026-2027",
      calendarType: "institution",
    });
  };

  const handleUpdate = () => {
    if (!calendars.data?.[0]) return;

    updateCalendar.mutate({
      id: calendars.data[0].id,
      academicYear: "2030-2031",
    });
  };

  const handleDelete = () => {
    if (!calendars.data?.[0]) return;

    deleteCalendar.mutate({
      id: calendars.data[0].id,
    });
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>API Test Page</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Button onClick={handleCreate}>Create Calendar</Button>
        <Button onClick={handleUpdate}>Update First Calendar</Button>
        <Button onClick={handleDelete}>Delete First Calendar</Button>
      </div>

      <h2>Calendars</h2>

      <pre>
        {JSON.stringify(calendars.data, null, 2)}
      </pre>
    </div>
  );
}