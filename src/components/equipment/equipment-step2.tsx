"use client"

import { useState } from "react"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Printer, Save, Loader2, Plus, Trash2 } from "lucide-react"
import type { EquipmentMeta, EquipmentItem } from "@/types/equipment"

type DBItem = {
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

type Props = {
  statementId: string
  meta: EquipmentMeta
  items: EquipmentItem[]
  setItems: (v: EquipmentItem[]) => void
  onDone: () => void
  onBack: () => void
  onPrint: () => void
}

function emptyItem(slNo: number): EquipmentItem {
  return {
    slNo,
    name: "",
    qtyAsSyllabus: "",
    qtyAvailable: "",
    dateOfPurchase: "",
    workingStatus: "",
    reasonsNotWorking: "",
    remarks: "",
  }
}

export default function EquipmentStep2({
  statementId,
  meta,
  items,
  setItems,
  onDone,
  onBack,
  onPrint,
}: Props) {
  const trpc = useTRPC()
  const [saving, setSaving] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const bulkSave = useMutation(trpc.equipmentItem.bulkSave.mutationOptions())

  // Load existing items from DB
  useQuery({
    ...trpc.equipmentItem.getByStatement.queryOptions({ statementId }),
    enabled: !!statementId,
    onSuccess: (existing: DBItem[]) => {
      if (hydrated || !existing || existing.length === 0) return
      setHydrated(true)
      setItems(
        existing.map((db) => ({
          id: db.id,
          slNo: db.slNo,
          name: db.name,
          qtyAsSyllabus: db.qtyAsSyllabus ?? "",
          qtyAvailable: db.qtyAvailable ?? "",
          dateOfPurchase: db.dateOfPurchase ?? "",
          workingStatus: (db.workingStatus ?? "") as EquipmentItem["workingStatus"],
          reasonsNotWorking: db.reasonsNotWorking ?? "",
          remarks: db.remarks ?? "",
        }))
      )
    },
  } as Parameters<typeof useQuery>[0])

  function addRow() {
    const nextSlNo = items.length > 0 ? Math.max(...items.map((i) => i.slNo)) + 1 : 1
    setItems([...items, emptyItem(nextSlNo)])
  }

  function removeRow(index: number) {
    const updated = items
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, slNo: i + 1 }))
    setItems(updated)
  }

  function updateCell(index: number, key: keyof EquipmentItem, value: string) {
    setItems(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  function handleSave() {
    setSaving(true)
    bulkSave.mutate(
      {
        statementId,
        items: items.map((item) => ({
          slNo: item.slNo,
          name: item.name,
          qtyAsSyllabus: item.qtyAsSyllabus || null,
          qtyAvailable: item.qtyAvailable || null,
          dateOfPurchase: item.dateOfPurchase || null,
          workingStatus: (item.workingStatus as "working" | "not_working") || null,
          reasonsNotWorking: item.reasonsNotWorking || null,
          remarks: item.remarks || null,
        })),
      },
      {
        onSuccess: () => { setSaving(false); onDone() },
        onError: () => setSaving(false),
      }
    )
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Step 2 — Equipment Items</CardTitle>
              <CardDescription className="mt-1">
                Add all instruments, equipment and machines for this lab/workshop.
                <span className="ml-2 font-medium text-foreground">{meta.labWorkshop}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline">{meta.academicYear}</Badge>
              <Badge variant="secondary">
                {meta.formatType === "H33" ? "INS-FORMAT-H33" : "INS-FORMAT-33"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Button variant="outline" size="sm" onClick={addRow} className="gap-2">
            <Plus className="h-3.5 w-3.5" /> Add Row
          </Button>
          <span className="text-xs text-muted-foreground ml-3">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-xs border-b">
                <th className="px-3 py-2.5 text-left font-medium w-12">Sl. No.</th>
                <th className="px-3 py-2.5 text-left font-medium min-w-[220px]">Name of Instrument / Equipment / Machine</th>
                <th className="px-3 py-2.5 text-left font-medium w-28">Qty as per Syllabus</th>
                <th className="px-3 py-2.5 text-left font-medium w-28">Qty Available</th>
                <th className="px-3 py-2.5 text-left font-medium w-32">Date of Purchase</th>
                <th className="px-3 py-2.5 text-left font-medium w-36">Working Status</th>
                <th className="px-3 py-2.5 text-left font-medium min-w-[160px]">Reasons for Not Working</th>
                <th className="px-3 py-2.5 text-left font-medium w-32">Remarks</th>
                <th className="px-3 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                    No items yet. Click <strong>Add Row</strong> to start adding equipment.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.slNo} className="border-b last:border-0">
                    <td className="px-3 py-1.5 text-center text-muted-foreground text-xs">{item.slNo}</td>
                    <td className="px-3 py-1.5">
                      <Input value={item.name} placeholder="Equipment name..." onChange={(e) => updateCell(index, "name", e.target.value)} className="h-8 text-xs" />
                    </td>
                    <td className="px-3 py-1.5">
                      <Input value={item.qtyAsSyllabus} placeholder="e.g. 10" onChange={(e) => updateCell(index, "qtyAsSyllabus", e.target.value)} className="h-8 text-xs" />
                    </td>
                    <td className="px-3 py-1.5">
                      <Input value={item.qtyAvailable} placeholder="e.g. 8" onChange={(e) => updateCell(index, "qtyAvailable", e.target.value)} className="h-8 text-xs" />
                    </td>
                    <td className="px-3 py-1.5">
                      <Input type="date" value={item.dateOfPurchase} onChange={(e) => updateCell(index, "dateOfPurchase", e.target.value)} className="h-8 text-xs" />
                    </td>
                    <td className="px-3 py-1.5">
                      <Select value={item.workingStatus} onValueChange={(val) => updateCell(index, "workingStatus", val)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="working">Working</SelectItem>
                          <SelectItem value="not_working">Not Working</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        value={item.reasonsNotWorking}
                        placeholder="Reason..."
                        onChange={(e) => updateCell(index, "reasonsNotWorking", e.target.value)}
                        className="h-8 text-xs"
                        disabled={item.workingStatus === "working"}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <Input value={item.remarks} placeholder="Remarks..." onChange={(e) => updateCell(index, "remarks", e.target.value)} className="h-8 text-xs" />
                    </td>
                    <td className="px-3 py-1.5">
                      <button type="button" onClick={() => removeRow(index)} className="p-1.5 rounded hover:bg-muted transition-colors">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Button variant="outline" size="sm" onClick={addRow} className="gap-2">
          <Plus className="h-3.5 w-3.5" /> Add Another Row
        </Button>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onPrint} className="gap-2">
            <Printer className="h-4 w-4" /> Preview & Print
          </Button>
          <Button onClick={handleSave} disabled={saving || items.length === 0} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Statement
          </Button>
        </div>
      </div>
    </div>
  )
}