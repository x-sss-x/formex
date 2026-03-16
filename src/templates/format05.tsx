import Image from "next/image";

export type TimetableDay = "TIME" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export type Format05Row = {
  day: TimetableDay;
  period1: string;
  period2: string;
  period3: string;
  period4: string;
  period5: string;
  period6: string;
  period7: string;
};

export type Format05Data = {
  institutionName: string;
  code: string;
  academicYear: string;
  withEffectFrom: string;
  email?: string;
  phone?: string;
  formNo?: string;
  revision?: string;
  date?: string;
  logoUrl?: string;
  yearFrom: string;
  yearTo: string;
  program: string;
  semester: string;
  lhDhNo: string;
  rows: Format05Row[];
};

// TIME row + 6 day rows = 7 total
const DAY_ORDER: TimetableDay[] = ["TIME", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Seal_of_Karnataka.svg/120px-Seal_of_Karnataka.svg.png";

export default function Format05({ data }: { data: Format05Data }) {
  const getRow = (day: TimetableDay): Format05Row =>
    data.rows.find((r) => r.day === day) ?? {
      day, period1: "", period2: "", period3: "",
      period4: "", period5: "", period6: "", period7: "",
    };

  const cell: React.CSSProperties = {
    border: "1px solid black",
    padding: "5pt 3pt",
    textAlign: "center",
    fontSize: "8pt",
    verticalAlign: "middle",
    wordBreak: "break-word",
    minHeight: "22pt",
  };

  const boldCell: React.CSSProperties = {
    ...cell,
    fontWeight: "bold",
    fontSize: "8.5pt",
  };

  return (
    <div
      style={{
        width: "277mm",
        minHeight: "190mm",
        padding: "8mm 10mm 8mm 10mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "9pt",
        backgroundColor: "white",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* ── HEADER ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", marginBottom: "8pt" }}>
        <tbody>
          <tr>
            {/* Logo */}
            <td style={{ width: "62pt", border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "3pt" }}>
              <Image
                src={data.logoUrl ?? LOGO}
                alt="Karnataka Seal"
                width={50}
                height={50}
                style={{ objectFit: "contain", display: "block", margin: "0 auto" }}
                unoptimized
              />
            </td>
            {/* Center */}
            <td style={{ border: "1px solid black", textAlign: "center", verticalAlign: "middle", padding: "3pt 5pt" }}>
              <div style={{ fontSize: "10.5pt" }}>GOVERNMENT OF KARNATAKA</div>
              <div style={{ fontSize: "8.5pt" }}>Department of Collegiate and Technical Education</div>
              <div style={{ fontWeight: "bold", fontSize: "9.5pt", marginTop: "2pt" }}>
                GOVERNMENT/ AIDED/PRIVATE POLYTECHNIC, {data.institutionName || "__________"}
              </div>
              <div style={{ fontSize: "9pt" }}>- 00000</div>
              <div style={{ fontSize: "8pt", marginTop: "2pt" }}>
                E-Mail: {data.email || "-Institute /Dept. / Faculty (Official ID)."}&nbsp;&nbsp;
                Phone: {data.phone || ""}
              </div>
            </td>
            {/* Right */}
            <td style={{ width: "72pt", border: "1px solid black", verticalAlign: "top", padding: "4pt 5pt", fontSize: "8.5pt" }}>
              <div>Form No: {data.formNo ?? ""}</div>
              <div style={{ marginTop: "5pt" }}>Revision: {data.revision ?? ""}</div>
              <div style={{ marginTop: "5pt" }}>Date: {data.date ?? ""}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FORMAT TITLE ── */}
      <div style={{ textAlign: "center", marginBottom: "5pt" }}>
        <div style={{ fontWeight: "bold", fontSize: "10.5pt" }}>INS - FORMAT-5</div>
        <div style={{ fontWeight: "bold", fontSize: "10.5pt", marginTop: "2pt" }}>
          Class Time Table for The Year: {data.yearFrom || "202 _"}- {data.yearTo || "202 _"}
        </div>
      </div>

      {/* ── META ROW 1 ── */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5pt", marginBottom: "4pt", fontWeight: "bold" }}>
        <div>Institution Name: <span style={{ fontWeight: "normal" }}>{data.institutionName}</span></div>
        <div>Institution code: <span style={{ fontWeight: "normal" }}>{data.code}</span></div>
        <div>Academic year: <span style={{ fontWeight: "normal" }}>{data.academicYear}</span></div>
        <div>With effect from: <span style={{ fontWeight: "normal" }}>{data.withEffectFrom}</span></div>
      </div>

      {/* ── META ROW 2 ── */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5pt", marginBottom: "8pt", fontWeight: "bold" }}>
        <div>Name of the Program: <span style={{ fontWeight: "normal" }}>{data.program}</span></div>
        <div>Semester: <span style={{ fontWeight: "normal" }}>{data.semester}</span></div>
        <div>L.H./DH No: <span style={{ fontWeight: "normal" }}>{data.lhDhNo}</span></div>
      </div>

      {/* ── TIMETABLE ──
          Layout from PDF:
          DAY | PERIOD | 1 | 2 | 3 | 4 | [LUNCH BREAK spans all rows] | 5 | 6 | 7
          LUNCH BREAK is in the header row as a separate column header
          but spans all data rows vertically
      */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "8pt",
          marginBottom: "8pt",
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          <col style={{ width: "6.5%" }} />  
          <col style={{ width: "7%" }} />    
          <col style={{ width: "9.5%" }} />  
          <col style={{ width: "9.5%" }} />  
          <col style={{ width: "9.5%" }} />  
          <col style={{ width: "9.5%" }} />  
          <col style={{ width: "5%" }} />    
          <col style={{ width: "9.5%" }} />  
          <col style={{ width: "9.5%" }} />  
          <col style={{ width: "9.5%" }} />  
        </colgroup>

        <thead>
          <tr>
            <th style={boldCell}>DAY</th>
            <th style={boldCell}>PERIOD</th>
            <th style={boldCell}>1</th>
            <th style={boldCell}>2</th>
            <th style={boldCell}>3</th>
            <th style={boldCell}>4</th>
            {/* LUNCH BREAK header — empty, the vertical text is in tbody first row */}
            <th style={{ border: "1px solid black", padding: "3pt" }} />
            <th style={boldCell}>5</th>
            <th style={boldCell}>6</th>
            <th style={boldCell}>7</th>
          </tr>
        </thead>

        <tbody>
          {DAY_ORDER.map((day, index) => {
            const row = getRow(day);
            const isTimeRow = day === "TIME";
            const isFirst = index === 0;

            return (
              <tr key={day}>
                {/* DAY */}
                <td style={boldCell}>{day}</td>

                {/* PERIOD — TIME row shows "TIME", others empty */}
                <td style={isTimeRow ? boldCell : cell}>
                  {isTimeRow ? "TIME" : ""}
                </td>

                {/* Periods 1–4 */}
                <td style={isTimeRow ? boldCell : cell}>{row.period1}</td>
                <td style={isTimeRow ? boldCell : cell}>{row.period2}</td>
                <td style={isTimeRow ? boldCell : cell}>{row.period3}</td>
                <td style={isTimeRow ? boldCell : cell}>{row.period4}</td>

                {/* LUNCH BREAK — vertical text, spans all 7 rows, only on first row */}
                {isFirst && (
                  <td
                    rowSpan={DAY_ORDER.length}
                    style={{
                      border: "1px solid black",
                      textAlign: "center",
                      verticalAlign: "middle",
                      padding: "3pt 2pt",
                      fontSize: "7pt",
                      fontWeight: "bold",
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      transform: "rotate(180deg)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    LUNCH BREAK
                  </td>
                )}

                {/* Periods 5–7 */}
                <td style={isTimeRow ? boldCell : cell}>{row.period5}</td>
                <td style={isTimeRow ? boldCell : cell}>{row.period6}</td>
                <td style={isTimeRow ? boldCell : cell}>{row.period7}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── NOTES ── */}
      <div style={{ fontSize: "8.5pt", marginBottom: "14pt" }}>
        <div><strong>Note :1)</strong> Duration of each period is one hour.</div>
        <div style={{ marginLeft: "30pt" }}><strong>2)</strong> Monday to Friday contact hours - 7 Hours</div>
        <div style={{ marginLeft: "30pt" }}><strong>3)</strong>Saturday Contact Hours – 5 hours</div>
        <div style={{ marginLeft: "30pt" }}><strong>4)</strong>Total Contact Hours / week – 40 Hours.</div>
      </div>

      {/* ── SIGNATURES ── */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5pt", fontWeight: "bold" }}>
        <div>Signature of the Program coordinator with Seal</div>
        <div>Signature of Principal with Seal</div>
      </div>
    </div>
  );
}