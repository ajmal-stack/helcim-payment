'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handlePaymentReturn } from '../../services/helcimService';
import Navbar from '../../components/Navbar';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [transactionId, setTransactionId] = useState<string | undefined>(
    undefined
  );
  const [status, setStatus] = useState<string>('unknown');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if this is a completion from a payment
    const checkPaymentReturn = () => {
      // Get payment return data from URL parameters
      const { status, transactionId } = handlePaymentReturn();

      setStatus(status);
      setTransactionId(transactionId);

      // Also check session storage for transaction details (from the HelcimPayment component)
      const storedTransactionId = sessionStorage.getItem('transactionId');
      const checkoutCompleted = sessionStorage.getItem('checkoutCompleted');

      if (!transactionId && storedTransactionId) {
        setTransactionId(storedTransactionId);
      }

      if (status === 'success' || checkoutCompleted === 'true') {
        setStatus('success');
      }

      setLoading(false);
    };

    checkPaymentReturn();
  }, []);

  // Handle continuing to the shop
  const handleContinueShopping = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
          <div className='flex flex-col items-center justify-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
            <p className='mt-4 text-lg font-semibold'>
              Processing your order...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (status !== 'success') {
    return (
      <>
        <Navbar />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-red-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </div>
            <h1 className='text-3xl font-bold mb-4'>Payment Unsuccessful</h1>
            <p className='text-gray-600 mb-8'>
              We couldn&apos;t process your payment. Please try again or contact
              customer support.
            </p>
            <button
              onClick={handleContinueShopping}
              className='px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
            >
              Return to Shop
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <div className='text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8 text-green-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <h1 className='text-3xl font-bold mb-4'>Order Confirmed!</h1>
          <p className='text-gray-600 mb-2'>
            Thank you for your purchase. Your payment was successful.
          </p>
          {transactionId && (
            <p className='text-gray-600 mb-8'>
              Transaction ID:{' '}
              <span className='font-medium'>{transactionId}</span>
            </p>
          )}
          <div className='bg-blue-50 border border-blue-200 rounded-md p-4 max-w-md mx-auto mb-8'>
            <p className='text-blue-800 text-sm'>
              A confirmation email will be sent to you shortly with your order
              details.
            </p>
          </div>
          <button
            onClick={handleContinueShopping}
            className='px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
}
