import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='grid gap-8 md:grid-cols-2'>
      <div className='rounded-2xl bg-white p-8 shadow'>
        <h1 className='mb-2 text-2xl font-semibold'>Welcome to Yupsis</h1>
        <p className='mb-6 text-gray-600'>
          Unified catalog sourced from SSActiveWear and deployed to Shopify with
          real-time inventory.
        </p>
        <Button asChild>
          <Link href='/catalog'>Browse Catalog</Link>
        </Button>
      </div>
      <div className='rounded-2xl bg-white p-8 shadow'>
        <h2 className='mb-2 text-xl font-semibold'>Admin Dashboard</h2>
        <p className='mb-6 text-gray-600'>
          Import products, deploy to Shopify, monitor inventory and sync events.
        </p>
        <Button variant='outline' asChild>
          <Link href='/admin'>Open Admin</Link>
        </Button>
      </div>
    </div>
  );
}
