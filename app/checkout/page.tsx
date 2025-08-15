"use client"
import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function Checkout({ searchParams }:{searchParams:{product?:string}}) {
  const [product, setProduct] = useState<any>(null)
  const [variantId, setVariantId] = useState<number|undefined>(undefined)
  const [qty, setQty] = useState(1)

  useEffect(()=>{
    const pid = Number(searchParams.product||0)
    if (!pid) return
    ;(async()=>{
      const d = await api.products.one(pid)
      setProduct(d)
      setVariantId(d.variants?.[0]?.id)
    })()
  },[searchParams.product])

  const total = useMemo(()=>{
    if (!product || !variantId) return 0
    const v = product.variants.find((x:any)=>x.id===variantId)
    const price = Number(v?.price||0)
    return price * qty
  },[product, variantId, qty])

  async function placeOrder() {
    if (!product) return
    const variant = product.variants.find((x:any)=>x.id===variantId)
    const order = {
      id: Math.floor(Math.random()*1e9),
      line_items: [{
        sku: variant.sku,
        quantity: qty
      }]
    }
    try {
      await api.webhooks.createOrder(order)
      const orders = JSON.parse(localStorage.getItem("ORDERS")||"[]")
      orders.unshift({ id: order.id, productId: product.product.id, variantId, qty, total, ts: Date.now() })
      localStorage.setItem("ORDERS", JSON.stringify(orders))
      toast("Order placed successfully (demo). Inventory decremented.")
      window.location.href = "/orders"
    } catch (e:any) {
      toast("Order failed: " + e.message)
    }
  }

  if (!product) return <div>Loading...</div>

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader><CardTitle>Checkout</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">Select Variant</div>
            <select className="h-10 rounded-2xl border px-3 text-sm" value={variantId} onChange={e=>setVariantId(Number(e.target.value))}>
              {product.variants.map((v:any)=>(
                <option key={v.id} value={v.id}>{v.sku} — {[v.option1,v.option2,v.option3].filter(Boolean).join(" / ") || "Default"}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Quantity</div>
            <Input type="number" min={1} value={qty} onChange={e=>setQty(Number(e.target.value))} className="w-24" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
          <div className="text-xs text-gray-500">Demo checkout: no payment captured.</div>
          <Button className="w-full" onClick={placeOrder}>Place Order</Button>
        </CardContent>
      </Card>
    </div>
  )
}
