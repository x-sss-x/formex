import type {
  HigherEducation,
  HigherEducationStoreBody,
} from "@/lib/api/generated/models";

export function higherEducationDefaults(
  higherEducation?: HigherEducation,
): HigherEducationStoreBody {
  const parsedRank = Number(higherEducation?.rank ?? 1);

  return {
    college_name: higherEducation?.college_name ?? "",
    rank: Number.isFinite(parsedRank) && parsedRank > 0 ? parsedRank : 1,
  };
}
