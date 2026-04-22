import { minClassesRequiredCeil } from "./min-classes-required";

type MinAttendanceMinClassesHintProps = {
  totalHeldStr: string;
  minPercentStr: string;
};

export function MinAttendanceMinClassesHint({
  totalHeldStr,
  minPercentStr,
}: MinAttendanceMinClassesHintProps) {
  const total = Number.parseInt(totalHeldStr, 10);
  const minP = Number.parseFloat(minPercentStr);
  const minClasses = minClassesRequiredCeil(total, minP);
  if (minClasses === null) {
    return null;
  }

  return (
    <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
      Minimum attendances to reach this bar:{" "}
      <span className="text-foreground font-medium tabular-nums">
        {minClasses}
      </span>{" "}
      of {total}.
    </p>
  );
}
