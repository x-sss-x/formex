"use client"

import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, Loader2 } from "lucide-react"
import Image from "next/image"

type EquipmentItemRow = {
  id: string
  slNo: number
  name: string
  qtyAsSyllabus: string | null
  qtyAvailable: string | null
  dateOfPurchase: string | null
  workingStatus: "working" | "not_working" | null
  reasonsNotWorking: string | null
  remarks: string | null
}

type StatementDetail = {
  id: string
  program: string
  semester: string
  academicYear: string
  labWorkshop: string
  formatType: "H33" | "33"
  formNo: string | null
  revision: string | null
  headerDate: string | null
  institutionId: string
  institutionName: string | null
  institutionCode: string | null
  institutionEmail: string | null
  institutionPhone: string | null
  institutionLogoUrl: string | null
  branchId: string | null
  branchName: string | null
  departmentId: string | null
  departmentName: string | null
  items: EquipmentItemRow[]
}

type Props = {
  statementId: string
  onBack: () => void
}

export default function EquipmentPrint({ statementId, onBack }: Props) {
  const trpc = useTRPC()

  const { data: rawData, isLoading } = useQuery(
    trpc.equipment.getById.queryOptions({ id: statementId })
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!rawData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Statement not found.</p>
      </div>
    )
  }

  // Cast to typed shape
  const data = rawData as StatementDetail
  const items = (data.items ?? []) as EquipmentItemRow[]
  const formatCode = data.formatType === "H33" ? "INS-FORMAT-H33" : "INS-FORMAT-33"

  return (
    <>
      {/* Action bar — hidden on print */}
      <div className="no-print bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="text-sm text-muted-foreground font-medium">
          {formatCode} — {data.institutionName} — {data.academicYear}
        </div>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Print preview */}
      <div className="bg-gray-100 min-h-screen py-8 no-print-bg">
        <div
          id="print-area"
          className="bg-white mx-auto shadow-sm"
          style={{
            width: "297mm",
            minHeight: "210mm",
            padding: "10mm",
            fontFamily: "Arial, sans-serif",
            fontSize: "9pt",
          }}
        >
          {/* ── HEADER ── */}
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", marginBottom: "10pt" }}>
            <tbody>
              <tr>
                {/* Logo */}
                <td style={{ width: "70pt", border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "4pt" }}>
                  {data.institutionLogoUrl ? (
                    <Image
                      src={data.institutionLogoUrl}
                      alt="Logo"
                      width={55}
                      height={55}
                      style={{ objectFit: "contain" }}
                      unoptimized
                    />
                  ) : (
                    <div style={{ width: "55pt", height: "55pt", border: "1px dashed #ccc", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "7pt", color: "#aaa" }}>
                      LOGO
                    </div>
                  )}
                </td>

                {/* Center */}
                <td style={{ border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "4pt" }}>
                  <div style={{ fontWeight: "bold", fontSize: "11pt" }}>GOVERNMENT OF KARNATAKA</div>
                  <div style={{ fontSize: "9pt" }}>Department of Collegiate and Technical Education</div>
                  <div style={{ fontWeight: "bold", fontSize: "10pt", marginTop: "2pt" }}>
                    {data.institutionName
                      ? data.institutionName.toUpperCase()
                      : "GOVERNMENT/ AIDED/PRIVATE POLYTECHNIC, __________"}
                  </div>
                  <div style={{ fontSize: "9pt" }}>- {data.institutionCode ?? "00000"}</div>
                  <div style={{ fontSize: "8pt", marginTop: "2pt" }}>
                    E-Mail: {data.institutionEmail ?? "—"}&nbsp;&nbsp; Phone: {data.institutionPhone ?? "—"}
                  </div>
                </td>

                {/* Right */}
                <td style={{ width: "80pt", border: "1px solid black", verticalAlign: "top", padding: "4pt", fontSize: "8.5pt" }}>
                  <div>Form No: {data.formNo ?? ""}</div>
                  <div style={{ marginTop: "4pt" }}>Revision: {data.revision ?? ""}</div>
                  <div style={{ marginTop: "4pt" }}>Date: {data.headerDate ?? ""}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── FORMAT TITLE ── */}
          <div style={{ textAlign: "center", marginBottom: "10pt" }}>
            <div style={{ fontWeight: "bold", fontSize: "11pt" }}>{formatCode}</div>
            <div style={{ fontWeight: "bold", fontSize: "11pt", marginTop: "3pt" }}>
              Statement Showing List of Lab/ workshop Equipment
            </div>
          </div>

          {/* ── META FIELDS ── */}
          <table style={{ width: "100%", marginBottom: "10pt", fontSize: "9pt" }}>
            <tbody>
              <tr>
                <td style={{ paddingBottom: "5pt", width: "50%" }}>
                  <strong>Name of the Institution:</strong> {data.institutionName}
                </td>
                <td style={{ paddingBottom: "5pt" }}>
                  <strong>Institute Code:</strong> {data.institutionCode}
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: "5pt" }}>
                  <strong>Program:</strong> {data.program}
                </td>
                <td style={{ paddingBottom: "5pt" }}>
                  <strong>Semester:</strong> {data.semester}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Academic Year:</strong> {data.academicYear}
                </td>
                <td>
                  <strong>Lab/Workshop:</strong> {data.labWorkshop}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── EQUIPMENT TABLE ── */}
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", fontSize: "8.5pt", marginBottom: "10pt" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ border: "1px solid black", padding: "4pt 6pt", textAlign: "center", width: "28pt" }}>
                  Sl.<br />No.
                </th>
                <th style={{ border: "1px solid black", padding: "4pt 6pt", textAlign: "center" }}>
                  Name of instrument/Equipment/ Machine etc.
                </th>
                <th style={{ border: "1px solid black", padding: "4pt 6pt", textAlign: "center", width: "55pt" }}>
                  Quantity as per syllabus
                </th>
                <th style={{ border: "1px solid black", padding: "4pt 6pt", textAlign: "center", width: "50pt" }}>
                  Quantity actually available
                </th>
                <th style={{ border: "1px solid black", padding: "4pt 6pt", textAlign: "center", width: "48pt" }}>
                  Date of purchase
                </th>
                <th style={{ border: "1px solid black", padding: "4pt 6pt", textAlign: "center", width: "48pt" }}>
                  Working/ not working
                </th>
                <th style={{ border: "1px solid black", padding: "4pt 6pt", textAlign: "center", width: "70pt" }}>
                  Reasons for not working
                </th>
                <th style={{ border: "1px solid black", padding: "4pt 6pt", textAlign: "center", width: "50pt" }}>
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td style={{ border: "1px solid black", padding: "8pt 4pt" }}>&nbsp;</td>
                      <td style={{ border: "1px solid black", padding: "8pt 4pt" }}>&nbsp;</td>
                      <td style={{ border: "1px solid black", padding: "8pt 4pt" }}>&nbsp;</td>
                      <td style={{ border: "1px solid black", padding: "8pt 4pt" }}>&nbsp;</td>
                      <td style={{ border: "1px solid black", padding: "8pt 4pt" }}>&nbsp;</td>
                      <td style={{ border: "1px solid black", padding: "8pt 4pt" }}>&nbsp;</td>
                      <td style={{ border: "1px solid black", padding: "8pt 4pt" }}>&nbsp;</td>
                      <td style={{ border: "1px solid black", padding: "8pt 4pt" }}>&nbsp;</td>
                    </tr>
                  ))
                : items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ border: "1px solid black", padding: "5pt 4pt", textAlign: "center" }}>{item.slNo}</td>
                      <td style={{ border: "1px solid black", padding: "5pt 6pt" }}>{item.name}</td>
                      <td style={{ border: "1px solid black", padding: "5pt 4pt", textAlign: "center" }}>{item.qtyAsSyllabus ?? ""}</td>
                      <td style={{ border: "1px solid black", padding: "5pt 4pt", textAlign: "center" }}>{item.qtyAvailable ?? ""}</td>
                      <td style={{ border: "1px solid black", padding: "5pt 4pt", textAlign: "center" }}>{item.dateOfPurchase ?? ""}</td>
                      <td style={{ border: "1px solid black", padding: "5pt 4pt", textAlign: "center" }}>
                        {item.workingStatus === "working"
                          ? "Working"
                          : item.workingStatus === "not_working"
                            ? "Not Working"
                            : ""}
                      </td>
                      <td style={{ border: "1px solid black", padding: "5pt 4pt" }}>{item.reasonsNotWorking ?? ""}</td>
                      <td style={{ border: "1px solid black", padding: "5pt 4pt" }}>{item.remarks ?? ""}</td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* ── NOTE ── */}
          <div style={{ fontSize: "8.5pt", fontWeight: "bold", marginBottom: "20pt" }}>
            Note: Attach additional sheet if required
          </div>

          {/* ── SIGNATURES ── */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", fontWeight: "bold" }}>
            <div>Signature of lab/workshop in charge</div>
            <div>Signature of Program coordinator with seal</div>
            <div>Signature of the principal with seal</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .no-print-bg { background: white !important; padding: 0 !important; }
          #print-area { box-shadow: none !important; margin: 0 !important; width: 100% !important; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          @page { size: A4 landscape; margin: 0; }
        }
      `}</style>
    </>
  )
}