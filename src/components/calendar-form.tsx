"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CalendarMeta, CalendarEvent } from "@/types/calendar"

type Props = {
meta: CalendarMeta
setMeta: (v:CalendarMeta)=>void
events: CalendarEvent[]
setEvents: (v:CalendarEvent[])=>void
}

export default function CalendarForm({meta,setMeta,events,setEvents}:Props){

function handleMeta(key:string,value:string){
setMeta({...meta,[key]:value})
}

function handleLogo(e:any){
const file = e.target.files[0]
if(!file) return
const url = URL.createObjectURL(file)
setMeta({...meta,logo:url})
}

function handleEvent(index:number,key:string,value:string){
const updated=[...events]
updated[index]={...updated[index],[key]:value}
setEvents(updated)
}

return(

<Card className="p-6 space-y-6">

<h2 className="text-lg font-semibold">
Institution Details
</h2>

<div className="grid grid-cols-3 gap-4">

<Input
placeholder="Institution Name"
value={meta.institutionName}
onChange={(e)=>handleMeta("institutionName",e.target.value)}
/>

<Input
placeholder="Institution Code"
value={meta.institutionCode}
onChange={(e)=>handleMeta("institutionCode",e.target.value)}
/>

<Input
placeholder="Academic Year"
value={meta.academicYear}
onChange={(e)=>handleMeta("academicYear",e.target.value)}
/>

<Input
placeholder="Email"
value={meta.email}
onChange={(e)=>handleMeta("email",e.target.value)}
/>

<Input
placeholder="Phone"
value={meta.phone}
onChange={(e)=>handleMeta("phone",e.target.value)}
/>

<Input
placeholder="Form No"
value={meta.formNo}
onChange={(e)=>handleMeta("formNo",e.target.value)}
/>

<Input
placeholder="Revision"
value={meta.revision}
onChange={(e)=>handleMeta("revision",e.target.value)}
/>

<Input
type="date"
value={meta.date}
onChange={(e)=>handleMeta("date",e.target.value)}
/>

<Input type="file" onChange={handleLogo}/>

</div>

<h2 className="text-lg font-semibold mt-4">
Activities
</h2>

<div className="overflow-auto max-h-[400px] border">

<table className="w-full text-sm">

<thead>
<tr className="border-b">
<th>Week</th>
<th>Day</th>
<th>Date</th>
<th>Morning</th>
<th>Afternoon</th>
</tr>
</thead>

<tbody>

{events.map((e,i)=>(
<tr key={`${e.week}-${e.day}`} className="border-b">

<td>{e.week}</td>

<td>{e.day}</td>

<td>
<Input
value={e.date}
onChange={(v)=>handleEvent(i,"date",v.target.value)}
/>
</td>

<td>
<Input
value={e.morning}
onChange={(v)=>handleEvent(i,"morning",v.target.value)}
/>
</td>

<td>
<Input
value={e.afternoon}
onChange={(v)=>handleEvent(i,"afternoon",v.target.value)}
/>
</td>

</tr>
))}

</tbody>

</table>

</div>

<Button onClick={()=>window.print()}>
Print Calendar
</Button>

</Card>

)
}