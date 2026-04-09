import type { QueryClient } from "@tanstack/react-query";
import {
  getHigherEducationListByProgramQueryKey,
  getHigherEducationListByStudentQueryKey,
  getHigherEducationsIndexQueryKey,
} from "@/lib/api/generated/higher-education/higher-education";
import type { HigherEducation } from "@/lib/api/generated/models";

type HigherEducationInvalidateTarget = Pick<
  HigherEducation,
  "program_id" | "student_id"
> &
  Partial<Pick<HigherEducation, "program" | "student">>;

export async function invalidateHigherEducationCaches(
  queryClient: QueryClient,
  higherEducation: HigherEducationInvalidateTarget,
) {
  const programId = higherEducation.program_id || higherEducation.program?.id;
  const studentId = higherEducation.student_id || higherEducation.student?.id;

  await queryClient.invalidateQueries({
    queryKey: getHigherEducationsIndexQueryKey(),
  });

  if (programId) {
    await queryClient.invalidateQueries({
      queryKey: getHigherEducationListByProgramQueryKey(programId),
    });
  }

  if (studentId) {
    await queryClient.invalidateQueries({
      queryKey: getHigherEducationListByStudentQueryKey(studentId),
    });
  }
}
