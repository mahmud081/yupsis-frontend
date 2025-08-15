'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { toast } from 'sonner';

type Product = {
  id: number;
  title: string;
  brand?: string | null;
  category?: string | null;
};

export default function Admin() {
  const [token, setToken] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    const t =
      localStorage.getItem('ADMIN_TOKEN') ||
      process.env.NEXT_PUBLIC_ADMIN_TOKEN ||
      '';
    setToken(t || '');
  }, []);

  async function refresh() {
    const prods = await api.products.list({ page: 1, limit: 200 });
    setProducts(prods.items);
    try {
      const ev = await api.admin.events(token);
      setEvents(ev.items || []);
      const inv = await api.admin.inventory(token);
      setInventory(inv.items || []);
    } catch (e: any) {
      console.log(e.message);
    }
  }

  async function saveToken() {
    localStorage.setItem('ADMIN_TOKEN', token);
    toast('Admin token saved');
  }

  async function importSSAW() {
    await api.admin.importSSAW(token, 1, 50);
    toast('Import started (check Queues and Events)');
  }

  const analyticsData = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const e of events) {
      const d = new Date(e.createdAt).toISOString().slice(0, 10);
      byDay[d] = (byDay[d] || 0) + 1;
    }
    return Object.keys(byDay)
      .sort()
      .map((k) => ({ date: k, events: byDay[k] }));
  }, [events]);

  async function exportCSV() {
    const res = await api.admin.exportProducts(token, 'csv');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className='space-y-6'>
      {/* <Card>
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
        </CardHeader>
        <CardContent className='flex items-center gap-2'>
          <Input
            placeholder='x-admin-token'
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button onClick={saveToken}>Save</Button>
          <Button variant='outline' onClick={refresh}>
            Refresh
          </Button>
          <Button asChild variant='ghost'>
            <Link href='/admin/queues' target='_blank'>
              Open Queues UI
            </Link>
          </Button>
        </CardContent>
      </Card> */}

      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Import from SSActiveWear</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='text-sm text-gray-600'>
              Launch the import wizard (page 1, size 50). Re-run to fetch more
              pages.
            </div>
            <Button onClick={importSSAW}>Start Import</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Export Products</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='text-sm text-gray-600'>
              Download a CSV or JSON of current catalog.
            </div>
            <div className='flex gap-2'>
              <Button onClick={exportCSV}>CSV</Button>
              <Button
                variant='outline'
                onClick={async () => {
                  const res = await api.admin.exportProducts(token, 'json');
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'products.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell className='max-w-[320px] truncate'>
                    {p.title}
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      {p.brand && <Badge>{p.brand}</Badge>}
                      {p.category && <Badge>{p.category}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className='space-x-2'>
                    <Button
                      size='sm'
                      onClick={async () => {
                        await api.admin.deployShopify(token, p.id);
                        toast('Deployed to Shopify');
                      }}
                    >
                      Deploy
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={async () => {
                        await api.admin.updateShopify(token, p.id);
                        toast('Updated on Shopify');
                      }}
                    >
                      Update
                    </Button>
                    <Button size='sm' asChild variant='ghost'>
                      <a href={`/product/${p.id}`} target='_blank'>
                        View
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Monitor</CardTitle>
          </CardHeader>
          <CardContent className='max-h-96 overflow-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((i: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{i.variantId}</TableCell>
                    <TableCell>{i.location}</TableCell>
                    <TableCell>{i.available}</TableCell>
                    <TableCell>
                      {new Date(i.updatedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
