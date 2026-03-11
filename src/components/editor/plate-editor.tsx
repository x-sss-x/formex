"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { normalizeNodeId } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useState } from "react";
import { toast } from "sonner";
import { EditorKit } from "@/components/editor/editor-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { useTRPC } from "@/trpc/client";
import { Button } from "../ui/button";
import { FixedToolbar } from "../ui/fixed-toolbar";
import { FixedToolbarButtons } from "../ui/fixed-toolbar-buttons";
import { ToolbarGroup } from "../ui/toolbar";

export function PlateEditor() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(
    trpc.template.getById.queryOptions({ templateId: id }),
  );
  const [value, setValue] = useState(
    normalizeNodeId((data?.stateJSON as []) ?? []),
  );
  const { mutate, isPending } = useMutation(
    trpc.template.update.mutationOptions({
      onError(error) {
        toast.error(error.message);
      },
      async onSuccess() {
        toast.success("Changes saved successful");
        await queryClient.invalidateQueries(trpc.template.pathFilter());
      },
    }),
  );
  const editor = usePlateEditor({
    plugins: EditorKit,
    value,
  });

  const width = 794;
  const height = 1123;

  return (
    <Plate
      editor={editor}
      onValueChange={({ value }) => {
        setValue(value);
      }}
    >
      <FixedToolbar className="z-50">
        <ToolbarGroup>
          <Button
            onClick={() => router.back()}
            size={"icon-sm"}
            variant={"ghost"}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="text-sm px-3 font-semibold truncate">
            {data?.title}
          </div>
        </ToolbarGroup>
        <FixedToolbarButtons />
        <ToolbarGroup>
          <Button
            disabled={isPending}
            onClick={() => mutate({ stateJSON: value, templateId: id })}
            size={"sm"}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </ToolbarGroup>
      </FixedToolbar>

      <EditorContainer
        style={{ width, minHeight: height }}
        className="mx-auto bg-white"
      >
        <Editor variant="demo" />
      </EditorContainer>
    </Plate>
  );
}

const value = normalizeNodeId([]);
