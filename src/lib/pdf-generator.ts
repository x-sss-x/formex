/* PRINT FUNCTION 👇*/

/**
 * printFormat
 * Wraps the content of a DOM element in a print-only window
 * and triggers the browser print dialog.
 *
 * Usage:
 *   printFormat("print-area")
 */
export function printFormat(
  elementId: string,
  orientation: "portrait" | "landscape" = "portrait",
): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found.`);
    return;
  }
 
  const printWindow = window.open("", "_blank", "width=1200,height=900");
  if (!printWindow) {
    console.error("Could not open print window.");
    return;
  }
 
  printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Print</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        background: white;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      @page {
      
        margin: 10mm 12mm 10mm 12mm;
      }
      body > div {
        width: 100% !important;
        min-height: unset !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
      }
      img { max-width: 100%; height: auto; }
      table { page-break-inside: avoid; }
    </style>
  </head>
  <body>${element.innerHTML}</body>
</html>`);
 
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 600);
}