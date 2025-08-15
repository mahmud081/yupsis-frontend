"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProductDetail({ params }:{params:{id:string}}) {
  const [data, setData] = useState<any>(null)
  useEffect(()=>{
    (async ()=>{
      const d = await api.products.one(Number(params.id))
      setData(d)
    })()
  },[params.id])

  if (!data) return <div>Loading...</div>

  const p = data.product
  const vs = data.variants as any[]

  return (
    <Card>
      <CardHeader><CardTitle>{p.title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">{p.brand && <Badge>{p.brand}</Badge>}{p.category && <Badge>{p.category}</Badge>}</div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.description}</p>
        <div>
          <h4 className="mb-2 font-medium">Variants</h4>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {vs.map(v=>(
              <div key={v.id} className="rounded-xl border p-3">
                <div className="text-sm">SKU: {v.sku}</div>
                <div className="text-sm">Options: {[v.option1, v.option2, v.option3].filter(Boolean).join(" / ") || "—"}</div>
                <div className="text-sm">Price: {v.price ?? "0.00"}</div>
              </div>
            ))}
          </div>
        </div>
        <Button asChild><Link href={`/checkout?product=${p.id}`}>Proceed to Checkout</Link></Button>
      </CardContent>
    </Card>
  )
}
