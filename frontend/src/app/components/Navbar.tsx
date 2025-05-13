'use client';

import Link from 'next/link';
import CartIcon from './CartIcon';

export default function Navbar() {
  return (
    <nav className='bg-white shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16 items-center'>
          <div className='flex-shrink-0 flex items-center'>
            <Link href='/' className='text-xl font-bold text-gray-800'>
              TechShop
            </Link>
          </div>

          <div className='hidden sm:ml-6 sm:flex sm:items-center'>
            <Link
              href='/'
              className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer'
            >
              Home
            </Link>
            <Link
              href='/'
              className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer'
            >
              Products
            </Link>
            <Link
              href='/checkout'
              className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer'
            >
              Checkout
            </Link>
          </div>

          <div className='ml-4 flex items-center'>
            <Link href='/checkout'>
              <CartIcon />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
