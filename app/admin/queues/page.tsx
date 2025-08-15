"use client"
import { useEffect } from "react"

export default function QueuesRedirect() {
  useEffect(()=>{
    window.location.href = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080") + "/admin/queues"
  },[])
  return <div>Opening Queues UI…</div>
}
