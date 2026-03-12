import { studentRouter } from "./routers/student";
import { templateRouter } from "./routers/template";
import { calendarRouter } from "./routers/calendar";
import { eventRouter } from "./routers/event";
import { createRouter } from "./trpc";

export const appRouter = createRouter({
  template: templateRouter,
  student: studentRouter,
  calendar: calendarRouter,
  events: eventRouter,
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
