import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      {...props}
      strokeWidth={1.5}
      role="status"
      aria-label="Loading"
      className={cn("size-4 text-muted-foreground animate-spin", className)}
    />
  );
}

export { Spinner };
