"use client"

import { useState } from "react"
import CalendarForm from "@/components/calendar-form"
import CalendarPrint from "@/components/calendar-print"
import { CalendarMeta, CalendarEvent } from "@/types/calendar"

export default function Page() {

const [meta,setMeta] = useState<CalendarMeta>({
institutionName:"",
institutionCode:"",
academicYear:"",
email:"",
phone:"",
formNo:"",
revision:"",
date:"",
logo:""
})

const days = [
"Monday","Tuesday","Wednesday",
"Thursday","Friday","Saturday","Sunday"
]

const initialEvents:CalendarEvent[] = []

for(let w=1; w<=4; w++){
days.forEach(day=>{
initialEvents.push({
week:w,
day,
date:"",
morning:"",
afternoon:""
})
})
}

const [events,setEvents] = useState(initialEvents)

return (

<div className="p-8 space-y-8">

<CalendarForm
meta={meta}
setMeta={setMeta}
events={events}
setEvents={setEvents}
/>

<div id="print-area">
<CalendarPrint meta={meta} events={events}/>
</div>

</div>

)
}