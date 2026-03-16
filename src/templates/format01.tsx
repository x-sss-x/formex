import Image from "next/image";

export type Format01Data = {
  institutionName: string;
  code: string;
  email?: string;
  phone?: string;
  formNo?: string;
  revision?: string;
  date?: string;
  logoUrl?: string;
  vision: string;
  mission: string;
};

const LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Seal_of_Karnataka.svg/120px-Seal_of_Karnataka.svg.png";

export default function Format01({ data }: { data: Format01Data }) {
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
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", marginBottom: "14pt" }}>
        <tbody>
          <tr>
            {/* Logo */}
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
            {/* Center */}
            <td style={{ border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "3pt 6pt" }}>
              <div style={{ fontSize: "10.5pt", fontWeight: "normal" }}>GOVERNMENT OF KARNATAKA</div>
              <div style={{ fontSize: "9pt", fontWeight: "normal" }}>Department of Collegiate and Technical Education</div>
              <div style={{ fontWeight: "bold", fontSize: "10pt", marginTop: "2pt" }}>
                GOVERNMENT/ AIDED/PRIVATE POLYTECHNIC, {data.institutionName || "__________"}
              </div>
              <div style={{ fontSize: "10pt", fontWeight: "normal" }}>- 00000</div>
              <div style={{ fontSize: "8.5pt", fontWeight: "normal", marginTop: "2pt" }}>
                E-Mail: {data.email || "-Institute /Dept. / Faculty (Official ID)."}&nbsp;&nbsp;
                Phone: {data.phone || ""}
              </div>
            </td>
            {/* Right */}
            <td style={{ width: "78pt", border: "1px solid black", verticalAlign: "top", padding: "4pt 6pt", fontSize: "9pt" }}>
              <div>Form No: {data.formNo ?? ""}</div>
              <div style={{ marginTop: "6pt" }}>Revision: {data.revision ?? ""}</div>
              <div style={{ marginTop: "6pt" }}>Date: {data.date ?? ""}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FORMAT TITLE ── */}
      <div style={{ textAlign: "center", marginBottom: "12pt" }}>
        <div style={{ fontWeight: "bold", fontSize: "11pt" }}>INS - FORMAT-01</div>
      </div>

      {/* ── INSTITUTION NAME & CODE ── */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18pt", fontSize: "10pt" }}>
        <div><strong>Institution Name:</strong></div>
        <div><strong>Institution code:</strong></div>
      </div>

      {/* ── MAIN TITLE ── */}
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "11pt", marginBottom: "22pt" }}>
        Vision and Mission of the institute
      </div>

      {/* ── VISION ── */}
      <div style={{ marginBottom: "55pt" }}>
        <div style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "10pt" }}>
          Vision of the Institute:
        </div>
        <div style={{ fontSize: "10pt", lineHeight: "1.8", minHeight: "70pt", paddingLeft: "4pt", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {data.vision}
        </div>
      </div>

      {/* ── MISSION ── */}
      <div style={{ marginBottom: "55pt" }}>
        <div style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "10pt" }}>
          Mission of the Institute:
        </div>
        <div style={{ fontSize: "10pt", lineHeight: "1.8", minHeight: "70pt", paddingLeft: "4pt", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {data.mission}
        </div>
      </div>

      {/* ── SIGNATURE ── */}
      <div style={{ textAlign: "right", fontSize: "10pt", fontWeight: "bold", marginTop: "30pt" }}>
        Signature of the Principal with Seal
      </div>
    </div>
  );
}