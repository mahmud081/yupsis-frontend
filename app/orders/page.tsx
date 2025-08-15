"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  useEffect(()=>{
    setOrders(JSON.parse(localStorage.getItem("ORDERS")||"[]"))
  },[])

  return (
    <Card>
      <CardHeader><CardTitle>My Orders (Demo)</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {orders.length===0 && <div className="text-sm text-gray-500">No orders yet.</div>}
          {orders.map(o=>(
            <div key={o.id} className="rounded-xl border p-3 text-sm">
              <div>Order #{o.id}</div>
              <div>Product: {o.productId} • Variant: {o.variantId} • Qty: {o.qty}</div>
              <div>Total: ${Number(o.total||0).toFixed(2)}</div>
              <div>Placed: {new Date(o.ts).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
