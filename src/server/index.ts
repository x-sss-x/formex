import { studentRouter } from "./routers/student";
import { templateRouter } from "./routers/template";
import { calendarRouter } from "./routers/calendar";
import { eventRouter } from "./routers/event";
import { institutionRouter } from "./routers/institution";
import { branchRouter } from "./routers/branch";
import { departmentRouter } from "./routers/department";
import { equipmentRouter } from "./routers/equipment";
import { equipmentItemRouter } from "./routers/equipmentItem";
import { createRouter } from "./trpc";

export const appRouter = createRouter({
  template: templateRouter,
  student: studentRouter,
  calendar: calendarRouter,
  event: eventRouter,
  institution: institutionRouter,
  branch: branchRouter,
  department: departmentRouter,
  equipment: equipmentRouter,
  equipmentItem: equipmentItemRouter,
});

export type AppRouter = typeof appRouter;