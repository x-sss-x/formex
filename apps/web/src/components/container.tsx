import type { HTMLAttributes } from "react";
import { cn } from "../lib/utils";

export default function Container({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-2 space-y-2", className)} {...props}>
      {children}
    </div>
  );
}
