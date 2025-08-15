export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080"

async function req(path:string, init?:RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { "Content-Type":"application/json", ...(init?.headers||{}) } })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  products: {
    list: (q={ page:1, limit:50 }) => req(`/products?page=${q.page}&limit=${q.limit}`),
    one: (id:number) => req(`/products/${id}`)
  },
  admin: {
    importSSAW: (token:string, page=1, pageSize=50) => req(`/admin/import/ssactivewear`, { method:"POST", body: JSON.stringify({ page, pageSize }), headers: { "x-admin-token": token } }),
    deployShopify: (token:string, id:number) => req(`/admin/deploy/shopify/${id}`, { method:"POST", headers: { "x-admin-token": token } }),
    updateShopify: (token:string, id:number) => req(`/admin/update/shopify/${id}`, { method:"POST", headers: { "x-admin-token": token } }),
    inventory: (token:string) => req(`/admin/inventory`, { headers: { "x-admin-token": token } }),
    events: (token:string) => req(`/admin/sync-events`, { headers: { "x-admin-token": token } }),
    exportProducts: (token:string, format:"json"|"csv"="json") => fetch(`${API_BASE}/admin/export/products?format=${format}`, { headers: { "x-admin-token": token } })
  },
  webhooks: {
    // demo: simulate order by calling our server's Shopify order webhook endpoint
    createOrder: (order:any) => req(`/webhooks/shopify/orders/create`, { method:"POST", body: JSON.stringify(order), headers: { "X-Shopify-Hmac-Sha256": "demo-bypass" } })
  }
}
