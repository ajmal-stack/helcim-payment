'use client';

import { useState, useEffect } from 'react';
import { initializePayment } from '../services/helcimService';

interface HelcimPaymentProps {
  amount: number;
  orderId: string;
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onPaymentError: (error: string) => void;
  onCancel: () => void;
  returnUrl?: string;
}

const HelcimPayment = ({
  amount,
  orderId,
  customerData,
  onPaymentError,
  onCancel,
  returnUrl,
}: HelcimPaymentProps) => {
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize payment on component mount
    const startPaymentProcess = async () => {
      setLoading(true);
      setError(null);

      try {
        // Don't include customerCode or invoiceNumber as they're causing issues with Helcim API

        // Calculate default return URL if not provided
        const calculatedReturnUrl =
          returnUrl || `${window.location.origin}/checkout/success`;

        console.log('Initializing payment with:', {
          amount,
          returnUrl: calculatedReturnUrl,
        });

        const response = await initializePayment({
          amount,
          returnUrl: calculatedReturnUrl,
        });

        if (response.success && response.paymentUrl && response.helcimPayId) {
          setPaymentUrl(response.paymentUrl);

          // Automatically redirect to the Helcim payment page
          console.log(
            'Redirecting to Helcim payment URL:',
            response.paymentUrl
          );
          window.location.href = response.paymentUrl;
        } else {
          const errorMessage =
            typeof response.error === 'string'
              ? response.error
              : 'Failed to initialize payment';
          setError(errorMessage);
          onPaymentError(errorMessage);
        }
      } catch (err) {
        let errorMessage = 'An unknown error occurred';
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (err && typeof err === 'object' && 'message' in err) {
          errorMessage = String(err.message);
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        setError(errorMessage);
        onPaymentError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    startPaymentProcess();
  }, [amount, customerData, onPaymentError, returnUrl]);

  // Open Helcim payment redirect (manual fallback)
  const openHelcimPayment = () => {
    if (!paymentUrl) return;
    window.location.href = paymentUrl;
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center p-6 space-y-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        <p className='text-lg font-semibold'>Initializing payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-6 space-y-4'>
        <h3 className='text-lg font-semibold text-red-700'>Payment Error</h3>
        <p className='text-red-600'>{error}</p>
        <div className='flex space-x-4'>
          <button
            onClick={onCancel}
            className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-semibold'>Helcim Secure Payment</h3>
      </div>

      <div className='space-y-2'>
        <p className='text-gray-700'>
          Order Total:{' '}
          <span className='font-medium'>${amount.toFixed(2)} USD</span>
        </p>
        <p className='text-gray-700'>
          Order ID: <span className='font-medium'>{orderId}</span>
        </p>
      </div>

      <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
        <p className='text-sm text-blue-800'>
          You&apos;ll be redirected to Helcim&apos;s secure payment page to
          complete your purchase. Your payment information is securely processed
          by Helcim.
        </p>
      </div>

      <div className='flex space-x-4'>
        <button
          onClick={onCancel}
          className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors'
        >
          Cancel
        </button>
        <button
          onClick={openHelcimPayment}
          className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default HelcimPayment;
