'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Variant = {
  id: number;
  sku: string;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
  price?: string;
};
type Product = {
  id: number;
  title: string;
  brand?: string | null;
  category?: string | null;
  images?: string[] | null;
};

export default function Catalog() {
  const [items, setItems] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Record<number, Variant[]>>({});
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    (async () => {
      const data = await api.products.list({ page: 1, limit: 200 });
      const prods: Product[] = data.items;
      setItems(prods);
      // Fetch variants per product
      const load = async () => {
        const entries = await Promise.all(
          prods.map(async (p) => {
            const d = await api.products.one(p.id);
            return [p.id, d.variants] as const;
          })
        );
        setVariants(Object.fromEntries(entries));
      };
      load();
    })();
  }, []);

  const brands = useMemo(
    () =>
      Array.from(
        new Set(items.map((i) => i.brand).filter(Boolean) as string[])
      ),
    [items]
  );
  const categories = useMemo(
    () =>
      Array.from(
        new Set(items.map((i) => i.category).filter(Boolean) as string[])
      ),
    [items]
  );

  const filtered = items.filter((i) => {
    const text = (
      i.title +
      ' ' +
      (i.brand || '') +
      ' ' +
      (i.category || '')
    ).toLowerCase();
    const okText = !q || text.includes(q.toLowerCase());
    const okBrand = !brand || i.brand === brand;
    const okCat = !category || i.category === category;
    return okText && okBrand && okCat;
  });

  return (
    <div className='space-y-4'>
      <div className='rounded-2xl bg-white p-4 shadow'>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
          <Input
            placeholder='Search products...'
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Brand' />
            </SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Category' />
            </SelectTrigger>
            <SelectContent>
              {categories.map((b) => (
                <SelectItem value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant='ghost'
            onClick={() => {
              setQ('');
              setBrand('');
              setCategory('');
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {filtered.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className='line-clamp-2'>{p.title}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                {p.brand && <Badge>{p.brand}</Badge>}
                {p.category && <Badge>{p.category}</Badge>}
              </div>
              <div className='text-sm text-gray-600'>
                Variants: {variants[p.id]?.length ?? 0}
              </div>
              <div className='flex justify-between'>
                <Button asChild size='sm'>
                  <Link href={`/product/${p.id}`}>View</Link>
                </Button>
                <Button asChild variant='outline' size='sm'>
                  <Link href={`/checkout?product=${p.id}`}>Buy</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
