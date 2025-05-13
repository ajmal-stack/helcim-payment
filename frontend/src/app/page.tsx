'use client';

import Navbar from './components/Navbar';
import ProductList from './components/ProductList';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='py-6'>
          <h1 className='text-3xl font-bold text-center mb-2'>
            Welcome to TechUniqIIT
          </h1>
          <p className='text-gray-600 text-center mb-8'>
            Browse our latest products and add to cart
          </p>

          <ProductList />
        </div>
      </main>

      <footer className='bg-gray-100 mt-12 py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <p className='text-center text-gray-500'>
            TechUniqIIT is a platform for buying and selling products.
            <br />© 2025 TechUniqIIT. All prices in USD.
          </p>
        </div>
      </footer>
    </>
  );
}
