"use client";

import { exportToDocx } from "@platejs/docx-io";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import { ArrowDownToLineIcon } from "lucide-react";
import { PageSizes } from "pdf-lib";
import type { SlatePlugin } from "platejs";
import { useEditorRef } from "platejs/react";
import * as React from "react";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToolbarButton } from "./toolbar";

// import { DocxExportKit } from "@/components/editor/plugins/docx-export-kit";

export function ExportToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  const getCanvas = async () => {
    const { default: html2canvas } = await import("html2canvas-pro");

    const style = document.createElement("style");
    document.head.append(style);

    const canvas = await html2canvas(editor.api.toDOMNode(editor)!, {
      onclone: (document: Document) => {
        const editorElement = document.querySelector(
          '[contenteditable="true"]',
        );
        if (editorElement) {
          Array.from(editorElement.querySelectorAll("*")).forEach((element) => {
            const existingStyle = element.getAttribute("style") || "";
            element.setAttribute(
              "style",
              `${existingStyle}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important`,
            );
          });
        }
      },
    });
    style.remove();

    return canvas;
  };

  const downloadFile = async (url: string, filename: string) => {
    const response = await fetch(url);

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();

    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl);
  };

  const exportToPdf = async () => {
    const canvas = await getCanvas();

    const PDFLib = await import("pdf-lib");
    const pdfDoc = await PDFLib.PDFDocument.create();

    const page = pdfDoc.addPage(PageSizes.A4);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    const pngImage = await pdfDoc.embedPng(canvas.toDataURL("image/png"));

    const imgWidth = pngImage.width;
    const imgHeight = pngImage.height;

    // scale to match page width
    const scale = pageWidth / imgWidth;

    const width = pageWidth;
    const height = imgHeight * scale;

    page.drawImage(pngImage, {
      x: 0,
      y: pageHeight - height, // place image at top of page
      width,
      height,
    });

    const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true });

    await downloadFile(pdfBase64, "plate.pdf");
  };

  const exportToWord = async () => {
    const blob = await exportToDocx(editor.children, {
      editorPlugins: [...BaseEditorKit] as SlatePlugin[],
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plate.docx";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Export" isDropdown>
          <ArrowDownToLineIcon className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={exportToPdf}>
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={exportToWord}>
            Export as Word
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
