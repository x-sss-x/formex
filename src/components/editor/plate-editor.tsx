"use client";

import { normalizeNodeId } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";

import { EditorKit } from "@/components/editor/editor-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { FixedToolbar } from "../ui/fixed-toolbar";
import { FixedToolbarButtons } from "../ui/fixed-toolbar-buttons";

export function PlateEditor() {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value,
  });

  const width = 794;
  const height = 1123;

  return (
    <Plate editor={editor}>
      <FixedToolbar className="z-50">
        <FixedToolbarButtons />
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
