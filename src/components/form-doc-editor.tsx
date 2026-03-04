"use client";

import { type Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";

import { Editor, EditorContainer } from "@/components/ui/editor";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { BasicNodesKit } from "./editor/plugins/basic-nodes-kit";
import { ToolbarButton, ToolbarGroup } from "./ui/toolbar";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
} from "lucide-react";
import { BasicTextAlignKit } from "./editor/plugins/basic-text-align-kit";

const initialValue: Value = [
  {
    type: "h4",
    children: [{ text: "INS Format 23" }],
  },
];

export default function FormDocEditor() {
  const editor = usePlateEditor({
    plugins: [...BasicTextAlignKit, ...BasicNodesKit], // Add the mark plugins
    value: initialValue, // Set initial content
  });

  return (
    <Plate editor={editor}>
      <FixedToolbar className="justify-center rounded-t-lg">
        <ToolbarGroup>
          <MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">
            B
          </MarkToolbarButton>
          <MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">
            I
          </MarkToolbarButton>
          <MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">
            U
          </MarkToolbarButton>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.tf.toggleBlock("h2")}
            tooltip="Heading 2 (⌘+⌥+2)"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.tf.toggleBlock("h3")}
            tooltip="Heading 3 (⌘+⌥+3)"
          >
            H3
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.tf.toggleBlock("h4")}
            tooltip="Heading 4 (⌘+⌥+4)"
          >
            H4
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarButton
          onClick={() => {
            editor.tf.textAlign.setNodes("start");
            editor.tf.focus();
          }}
          tooltip="Align Left"
        >
          <AlignLeft />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            editor.tf.textAlign.setNodes("center");
            editor.tf.focus();
          }}
          tooltip="Align Center"
        >
          <AlignCenter />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            editor.tf.textAlign.setNodes("right");
            editor.tf.focus();
          }}
          tooltip="Align Right"
        >
          <AlignRight />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            editor.tf.textAlign.setNodes("justify");
            editor.tf.focus();
          }}
          tooltip="Align Justify"
        >
          <AlignJustify />
        </ToolbarButton>
      </FixedToolbar>
      {/* Provides editor context */}
      <EditorContainer className="h-svh">
        {/* Styles the editor area */}
        <Editor placeholder="Type your amazing content here..." />
      </EditorContainer>
    </Plate>
  );
}
