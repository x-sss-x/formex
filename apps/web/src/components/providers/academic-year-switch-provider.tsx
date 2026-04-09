"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuthSetAcademicYear } from "@/lib/api/generated/auth/auth";
import { cn } from "@/lib/utils";

type AcademicYearSwitchContextValue = {
  setAcademicYear: (year: number) => void;
  isSwitchingAcademicYear: boolean;
};

const AcademicYearSwitchContext =
  createContext<AcademicYearSwitchContextValue | null>(null);

export function useAcademicYearSwitch(): AcademicYearSwitchContextValue {
  const ctx = useContext(AcademicYearSwitchContext);
  if (!ctx) {
    throw new Error(
      "useAcademicYearSwitch must be used within AcademicYearSwitchProvider",
    );
  }
  return ctx;
}

type SwitchOverlayProps = {
  targetYear: number;
};

function AcademicYearSwitchOverlay({ targetYear }: SwitchOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-200 flex flex-col items-center justify-center",
        "bg-background/90 backdrop-blur-md",
        "animate-in fade-in duration-200",
      )}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="academic-year-switch-title"
      aria-describedby="academic-year-switch-desc"
      aria-busy="true"
    >
      <div className="flex max-w-md flex-col items-center gap-8 px-6 text-center">
        <div className="relative flex size-16 items-center justify-center">
          <span
            className="absolute size-14 rounded-full bg-primary/15 animate-ping"
            aria-hidden
          />
          <span
            className="absolute size-20 rounded-full border border-primary/25 animate-[pulse_2.5s_ease-in-out_infinite]"
            aria-hidden
          />
          <span className="font-brand text-primary text-xl">FORMEX</span>
        </div>

        <div className="space-y-3">
          <p
            id="academic-year-switch-title"
            className="text-lg font-medium leading-snug tracking-tight text-foreground"
          >
            Switching academic year to{" "}
            <span
              className={cn(
                "inline-block font-semibold tabular-nums text-primary",
                "motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-300",
              )}
            >
              {targetYear}
            </span>
          </p>
          <p
            id="academic-year-switch-desc"
            className="text-sm text-muted-foreground motion-safe:animate-pulse"
          >
            Please wait while we refresh your data across the app.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AcademicYearSwitchProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [pendingYear, setPendingYear] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pendingYear === null) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [pendingYear]);

  const { mutate, isPending } = useAuthSetAcademicYear(
    {
      mutation: {
        onMutate: (variables) => {
          setPendingYear(variables.data.academic_year);
        },
        onSettled: async (_data, error) => {
          try {
            if (!error) {
              await queryClient.invalidateQueries();
              await router.refresh();
            }
          } finally {
            setPendingYear(null);
          }
        },
      },
    },
    queryClient,
  );

  const setAcademicYear = useCallback(
    (year: number) => {
      mutate({ data: { academic_year: year } });
    },
    [mutate],
  );

  const value = useMemo<AcademicYearSwitchContextValue>(
    () => ({
      setAcademicYear,
      isSwitchingAcademicYear: isPending || pendingYear !== null,
    }),
    [setAcademicYear, isPending, pendingYear],
  );

  return (
    <AcademicYearSwitchContext.Provider value={value}>
      {children}
      {mounted && pendingYear !== null
        ? createPortal(
            <AcademicYearSwitchOverlay targetYear={pendingYear} />,
            document.body,
          )
        : null}
    </AcademicYearSwitchContext.Provider>
  );
}
