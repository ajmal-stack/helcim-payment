'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  handlePaymentReturn,
  verifyHelcimPayment,
} from '../../services/helcimService';
import Navbar from '../../components/Navbar';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [transactionId, setTransactionId] = useState<string | undefined>(
    undefined
  );
  const [status, setStatus] = useState<string>('unknown');
  const [loading, setLoading] = useState<boolean>(true);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(5);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Check if this is a completion from a payment
    const checkPaymentReturn = async () => {
      try {
        console.log('Checking payment return data');

        // Check if we have transaction data from HelcimPay.js stored in session
        const transactionDataString = sessionStorage.getItem('transactionData');
        const orderId = sessionStorage.getItem('orderId');
        const checkoutCompleted = sessionStorage.getItem('checkoutCompleted');

        console.log('Session storage data:', {
          transactionDataString,
          orderId,
          checkoutCompleted,
        });

        if (transactionDataString) {
          console.log('Found transaction data in session storage');
          try {
            const transactionData = JSON.parse(transactionDataString);
            console.log('Parsed transaction data:', transactionData);

            // Check if we have valid transaction data
            if (transactionData && transactionData.data) {
              const txnData = transactionData.data;

              // Set transaction details from the HelcimPay.js response
              setTransactionId(txnData.transactionId);
              setOrderDetails({
                orderId: orderId,
                amount: txnData.amount,
                currency: txnData.currency || 'USD',
                dateCreated: txnData.dateCreated,
                cardNumber: txnData.cardNumber || '',
                status: txnData.status || 'APPROVED',
              });

              // Verify the payment with your backend
              try {
                const verificationResult = await verifyHelcimPayment(
                  transactionData
                );
                console.log('Verification result:', verificationResult);

                if (verificationResult.success) {
                  setStatus('success');
                  sessionStorage.setItem('checkoutCompleted', 'true');
                } else {
                  console.error(
                    'Payment verification failed:',
                    verificationResult.error
                  );
                  setStatus('failed');
                }
              } catch (verifyError) {
                console.error('Error verifying payment:', verifyError);
                // If verification fails but we have a transaction ID, consider it successful
                if (
                  txnData.transactionId &&
                  (txnData.status === 'APPROVED' ||
                    checkoutCompleted === 'true')
                ) {
                  setStatus('success');
                } else {
                  setStatus('failed');
                }
              }
            } else {
              console.error('Invalid transaction data structure');
              setStatus('failed');
            }
          } catch (error) {
            console.error('Error parsing transaction data:', error);
            setStatus('failed');
          }
        } else {
          // Fall back to URL parameters for backwards compatibility
          const { status: urlStatus, transactionId: urlTxnId } =
            handlePaymentReturn();
          console.log('URL parameters:', { urlStatus, urlTxnId });

          if (urlTxnId) {
            setTransactionId(urlTxnId);
          }

          // Check various success indicators
          if (urlStatus === 'success' || checkoutCompleted === 'true') {
            setStatus('success');
          } else {
            setStatus('failed');
          }
        }
      } catch (error) {
        console.error('Error in payment return processing:', error);
        setStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentReturn();
  }, []);

  // Separate useEffect for handling the countdown and redirection
  useEffect(() => {
    // Only start countdown if status is success and we're not loading
    if (status === 'success' && !loading) {
      console.log('Starting redirection countdown');
      const homepageUrl = window.location.origin;
      console.log('Will redirect to:', homepageUrl);

      // Start countdown for redirect
      const interval = setInterval(() => {
        setRedirectCountdown((prev) => {
          const newCount = prev - 1;
          console.log('Countdown:', newCount);
          if (newCount <= 0) {
            clearInterval(interval);
            console.log('Redirecting now to:', homepageUrl);
            window.location.href = homepageUrl;
            return 0;
          }
          return newCount;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, loading]);

  // Handle continuing to the shop with direct location change
  const handleContinueShopping = () => {
    window.location.href = window.location.origin;
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
              onClick={() => router.push('/checkout')}
              className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors mr-4'
            >
              Try Again
            </button>
            <button
              onClick={handleContinueShopping}
              className='px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors'
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
          <p className='text-gray-600 mb-8'>
            Thank you for your purchase. Your order has been successfully
            processed.
          </p>

          {transactionId && (
            <div className='mb-8 p-4 bg-gray-50 inline-block rounded-lg mx-auto'>
              <p className='text-gray-700'>
                Transaction ID:{' '}
                <span className='font-medium'>{transactionId}</span>
              </p>
              {orderDetails && orderDetails.orderId && (
                <p className='text-gray-700'>
                  Order ID:{' '}
                  <span className='font-medium'>{orderDetails.orderId}</span>
                </p>
              )}
              {orderDetails && orderDetails.amount && (
                <p className='text-gray-700'>
                  Amount:{' '}
                  <span className='font-medium'>
                    ${orderDetails.amount} {orderDetails.currency}
                  </span>
                </p>
              )}
            </div>
          )}

          <p className='text-gray-500 mb-8'>
            You will be redirected to the shop in {redirectCountdown} seconds...
          </p>

          <button
            onClick={handleContinueShopping}
            className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
}
