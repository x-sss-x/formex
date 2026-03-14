import { studentRouter } from "./routers/student";
import { templateRouter } from "./routers/template";
import { calendarRouter } from "./routers/calendar";
import { eventRouter } from "./routers/event";
import { institutionRouter } from "./routers/institution";
import { branchRouter } from "./routers/branch";
import { departmentRouter } from "./routers/department";
import { createRouter } from "./trpc";

export const appRouter = createRouter({
  template: templateRouter,
  student: studentRouter,
  calendar: calendarRouter,
  event: eventRouter,         // was "events" — renamed to "event" to match trpc.event.xxx usage
  institution: institutionRouter,
  branch: branchRouter,
  department: departmentRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;