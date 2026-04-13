import type { QueryClient } from "@tanstack/react-query";
import {
  getSkillProgramListByProgramQueryKey,
  getSkillProgramListBySemesterQueryKey,
  getSkillProgramsIndexQueryKey,
} from "@/lib/api/generated/skill-program/skill-program";
import type { SkillProgram } from "@/lib/api/generated/models";

type SkillProgramInvalidateTarget = Pick<SkillProgram, "program_id" | "semester"> &
  Partial<Pick<SkillProgram, "program">>;

export async function invalidateSkillProgramCaches(
  queryClient: QueryClient,
  skillProgram: SkillProgramInvalidateTarget,
) {
  const programId = skillProgram.program_id || skillProgram.program?.id;

  await queryClient.invalidateQueries({
    queryKey: getSkillProgramsIndexQueryKey(),
  });
  if (programId) {
    await queryClient.invalidateQueries({
      queryKey: getSkillProgramListByProgramQueryKey(programId),
    });
    await queryClient.invalidateQueries({
      queryKey: getSkillProgramListBySemesterQueryKey(
        programId,
        skillProgram.semester,
      ),
    });
  }
}
