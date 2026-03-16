import Image from "next/image";

export type Format02Data = {
  institutionName: string;
  code: string;
  email?: string;
  phone?: string;
  formNo?: string;
  revision?: string;
  date?: string;
  logoUrl?: string;
  program: string;
  visionOfProgram: string;
  missionOfProgram: string;
  peos: { label: string; description: string }[];
  consistencyRows: { peo: string; m1: string; m2: string; mn: string }[];
};

const LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Seal_of_Karnataka.svg/120px-Seal_of_Karnataka.svg.png";

export default function Format02({ data }: { data: Format02Data }) {
  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm 15mm 10mm 15mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "10pt",
        backgroundColor: "white",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* ── HEADER ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", marginBottom: "12pt" }}>
        <tbody>
          <tr>
            <td style={{ width: "68pt", border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "4pt" }}>
              <Image
                src={data.logoUrl ?? LOGO}
                alt="Karnataka Seal"
                width={56}
                height={56}
                style={{ objectFit: "contain", display: "block", margin: "0 auto" }}
                unoptimized
              />
            </td>
            <td style={{ border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "3pt 6pt" }}>
              <div style={{ fontSize: "10.5pt" }}>GOVERNMENT OF KARNATAKA</div>
              <div style={{ fontSize: "9pt" }}>Department of Collegiate and Technical Education</div>
              <div style={{ fontWeight: "bold", fontSize: "10pt", marginTop: "2pt" }}>
                GOVERNMENT/ AIDED/PRIVATE POLYTECHNIC, {data.institutionName || "__________"}
              </div>
              <div style={{ fontSize: "10pt" }}>- 00000</div>
              <div style={{ fontSize: "8.5pt", marginTop: "2pt" }}>
                E-Mail: {data.email || "-Institute /Dept. / Faculty (Official ID)."}&nbsp;&nbsp;
                Phone: {data.phone || ""}
              </div>
            </td>
            <td style={{ width: "78pt", border: "1px solid black", verticalAlign: "top", padding: "4pt 6pt", fontSize: "9pt" }}>
              <div>Form No: {data.formNo ?? ""}</div>
              <div style={{ marginTop: "6pt" }}>Revision: {data.revision ?? ""}</div>
              <div style={{ marginTop: "6pt" }}>Date: {data.date ?? ""}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FORMAT TITLE ── */}
      <div style={{ textAlign: "center", marginBottom: "10pt" }}>
        <div style={{ fontWeight: "bold", fontSize: "11pt" }}>INS - FORMAT-2</div>
      </div>

      {/* ── INSTITUTION NAME, CODE, PROGRAM ── */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6pt", fontSize: "10pt" }}>
        <div><strong>Institution Name:</strong> <span>{data.institutionName}</span></div>
        <div><strong>Institution code:</strong> <span>{data.code}</span></div>
      </div>
      <div style={{ fontSize: "10pt", marginBottom: "12pt" }}>
        <strong>Program:</strong> <span>{data.program}</span>
      </div>

      {/* ── MAIN TITLE ── */}
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "11pt", marginBottom: "14pt" }}>
        Vision, Mission, And Program Education Objectives of the Program
      </div>

      {/* ── VISION ── */}
      <div style={{ marginBottom: "18pt" }}>
        <div style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "6pt" }}>
          &nbsp;Vision of the Program:
        </div>
        <div style={{ fontSize: "10pt", lineHeight: "1.8", minHeight: "40pt", paddingLeft: "4pt", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {data.visionOfProgram}
        </div>
      </div>

      {/* ── MISSION ── */}
      <div style={{ marginBottom: "18pt" }}>
        <div style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "6pt" }}>
          Mission of the program:
        </div>
        <div style={{ fontSize: "10pt", lineHeight: "1.8", minHeight: "40pt", paddingLeft: "4pt", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {data.missionOfProgram}
        </div>
      </div>

      {/* ── PEOs ── */}
      <div style={{ marginBottom: "14pt" }}>
        <div style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "8pt" }}>
          Program Education Objectives (PEO):
        </div>
        {data.peos.map((peo) => (
          <div key={peo.label} style={{ fontSize: "10pt", marginBottom: "5pt", display: "flex", gap: "4pt" }}>
            <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>{peo.label} -</span>
            <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{peo.description}</span>
          </div>
        ))}
      </div>

      {/* ── CONSISTENCY TABLE ── */}
      <div style={{ marginBottom: "18pt" }}>
        <div style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "8pt" }}>
          Establish consistency of PEOs with Mission of the Program/Department
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
          <thead>
            <tr>
              {["PEO", "M1", "M2", "Mn"].map((h) => (
                <th key={h} style={{ border: "1px solid black", padding: "6pt 10pt", textAlign: "center", fontWeight: "bold", width: "25%" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.consistencyRows.map((row) => (
              <tr key={row.peo}>
                <td style={{ border: "1px solid black", padding: "8pt 10pt", textAlign: "center", fontWeight: "bold" }}>{row.peo}</td>
                <td style={{ border: "1px solid black", padding: "8pt 10pt", textAlign: "center" }}>{row.m1}</td>
                <td style={{ border: "1px solid black", padding: "8pt 10pt", textAlign: "center" }}>{row.m2}</td>
                <td style={{ border: "1px solid black", padding: "8pt 10pt", textAlign: "center" }}>{row.mn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── SIGNATURES ── */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10pt", fontWeight: "bold", marginTop: "28pt" }}>
        <div>Signature of the Program coordinator</div>
        <div>Signature of the Principal with Seal</div>
      </div>
    </div>
  );
}