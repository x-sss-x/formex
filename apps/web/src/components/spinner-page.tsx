import { Spinner } from "./ui/spinner";

export function SpinnerPage() {
  return (
    <div className="flex h-[calc(100svh-40svh)] w-full items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}
