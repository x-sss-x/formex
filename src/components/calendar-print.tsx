import { CalendarMeta, CalendarEvent } from "@/types/calendar";
import Image from "next/image";

type Props={
meta:CalendarMeta
events:CalendarEvent[]
}

export default function CalendarPrint({meta,events}:Props){

return(

<div className="print-container text-xs">

<div className="grid grid-cols-[120px_1fr_200px] border">

<div className="border flex items-center justify-center">

{meta.logo && (
<Image 
src={meta.logo}
alt="Institution Logo"
width={80}
height={80}
unoptimized
className="h-20 w-auto object-contain"/>
)}

</div>

<div className="border text-center">

<p className="font-bold">
GOVERNMENT OF KARNATAKA
</p>

<p>
Department of Collegiate and Technical Education
</p>

<p className="font-bold">
GOVERNMENT / AIDED / PRIVATE POLYTECHNIC
</p>

<p>- 00000</p>

<p>
E-Mail: {meta.email} Phone: {meta.phone}
</p>

</div>

<div className="border p-2">

<p>Form No: {meta.formNo}</p>
<p>Revision: {meta.revision}</p>
<p>Date: {meta.date}</p>

</div>

</div>

<div className="text-center mt-4">

<p className="font-bold">
INS - FORMAT-3
</p>

<p>
Academic Calendar of the Institution
</p>

</div>

<div className="flex justify-between mt-4">

<p>Institution Name: {meta.institutionName}</p>
<p>Institution code: {meta.institutionCode}</p>
<p>Academic year: {meta.academicYear}</p>

</div>

<table className="w-full border mt-4">

<thead>

<tr>

<th rowSpan={2} className="border">Week</th>
<th rowSpan={2} className="border">Day</th>
<th rowSpan={2} className="border">Date</th>
<th colSpan={2} className="border">
Activities
</th>

</tr>

<tr>

<th className="border">Morning Session</th>
<th className="border">Afternoon Session</th>

</tr>

</thead>

<tbody>

{events.map((e)=>{

const isSunday = e.day==="Sunday"

return(

<tr
key={`${e.week}-${e.day}`}
className={`border ${isSunday?"bg-blue-200":""}`}
>

<td className="border text-center">
{e.week}
</td>

<td className="border">
{e.day}
</td>

<td className="border">
{e.date}
</td>

<td className="border">
{e.morning}
</td>

<td className="border">
{e.afternoon}
</td>

</tr>

)

})}

</tbody>

</table>

<div className="flex justify-between mt-8">

<p className="text-[10px] max-w-[70%]">

Note: All the Co-Curricular (Including Curriculum gap),
Extra Curricular activities for odd & even Semester
are to be planned at the commencement the academic
year in line with the BTE academic calendar of events.

</p>

<p>
Signature of the Principal with Seal
</p>

</div>

</div>

)
}