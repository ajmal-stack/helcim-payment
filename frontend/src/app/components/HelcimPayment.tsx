'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  homepageUrl?: string;
}

const HelcimPayment = ({
  amount,
  orderId,
  customerData,
  onPaymentError,
  onCancel,
  returnUrl,
  homepageUrl,
}: HelcimPaymentProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutToken, setCheckoutToken] = useState<string | null>(null);
  const router = useRouter();

  // Function to add the HelcimPay.js script to the page
  const addHelcimPayScript = () => {
    // Check if script already exists
    if (
      document.querySelector(
        'script[src="https://secure.helcim.app/helcim-pay/services/start.js"]'
      )
    ) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://secure.helcim.app/helcim-pay/services/start.js';
    script.async = true;
    script.onload = () => {
      console.log('HelcimPay.js script loaded');
    };
    document.head.appendChild(script);
  };

  // Listen for payment events from the iframe
  useEffect(() => {
    if (!checkoutToken) return;

    const handlePaymentMessage = (event: MessageEvent) => {
      const helcimPayJsIdentifierKey = 'helcim-pay-js-' + checkoutToken;

      if (event.data.eventName === helcimPayJsIdentifierKey) {
        console.log('Received event from HelcimPay.js:', event.data);
        console.log('Event origin:', event.origin);
        console.log('Environment variables:', {
          apiUrl: process.env.NEXT_PUBLIC_API_URL || 'not set',
        });

        if (event.data.eventStatus === 'ABORTED') {
          console.error('Transaction failed!', event.data.eventMessage);
          // Handle payment failure
          onPaymentError(
            typeof event.data.eventMessage === 'string'
              ? event.data.eventMessage
              : 'Payment was declined or cancelled.'
          );

          // Reset loading state
          setPaymentLoading(false);

          // Remove the iframe
          removeHelcimPayIframe();
        }

        if (event.data.eventStatus === 'SUCCESS') {
          console.log('Transaction success!', event.data.eventMessage);

          try {
            // Handle double-stringified response
            let responseData = event.data.eventMessage;

            // First parse if it's a string
            if (typeof responseData === 'string') {
              responseData = JSON.parse(responseData);
            }

            // Then handle the nested structure
            if (responseData.data && responseData.data.data) {
              const transactionData = responseData.data.data;

              // Validate essential transaction data
              if (!transactionData.transactionId) {
                throw new Error('Missing transaction ID in response');
              }

              // Set success status in session storage
              sessionStorage.setItem('checkoutCompleted', 'true');

              // Store transaction data in session storage
              sessionStorage.setItem(
                'transactionData',
                JSON.stringify({
                  data: transactionData,
                })
              );
              sessionStorage.setItem('orderId', orderId);

              // Remove the iframe
              removeHelcimPayIframe();

              // Redirect to success page
              const successUrl = returnUrl || '/checkout/success';
              router.push(successUrl);
            } else {
              throw new Error('Invalid response data structure');
            }
          } catch (error) {
            console.error('Error processing success response:', error);
            onPaymentError('Error processing payment response');
          }
        }

        if (event.data.eventStatus === 'HIDE') {
          console.log('Payment modal was closed');
          setPaymentLoading(false);
          removeHelcimPayIframe();
          onCancel();
        }
      }
    };

    // Add event listener
    window.addEventListener('message', handlePaymentMessage);

    // Clean up
    return () => {
      window.removeEventListener('message', handlePaymentMessage);
    };
  }, [checkoutToken, onPaymentError, onCancel, orderId, returnUrl, router]);

  // Initialize payment and get the checkout token
  useEffect(() => {
    const fetchCheckoutToken = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calculate default return URL if not provided
        const calculatedReturnUrl =
          returnUrl || `${window.location.origin}/checkout/success`;
        const calculatedHomepageUrl = homepageUrl || window.location.origin;

        console.log('Initializing payment with:', {
          amount,
          returnUrl: calculatedReturnUrl,
          homepageUrl: calculatedHomepageUrl,
        });

        const response = await initializePayment({
          amount,
          returnUrl: calculatedReturnUrl,
          homepageUrl: calculatedHomepageUrl,
        });

        if (response.success && response.checkoutToken) {
          setCheckoutToken(response.checkoutToken);
          // Add the HelcimPay.js script
          addHelcimPayScript();
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

    fetchCheckoutToken();
  }, [amount, customerData, onPaymentError, returnUrl, homepageUrl]);

  // Function to open the HelcimPay modal
  const openHelcimPayModal = () => {
    if (!checkoutToken) return;

    setPaymentLoading(true);

    // Call the HelcimPay.js function to open the modal
    // @ts-ignore - this function is added by the external script
    window.appendHelcimPayIframe(checkoutToken, true);

    // Set a timeout to reset loading state if iframe doesn't load
    setTimeout(() => {
      setPaymentLoading(false);
    }, 5000);
  };

  // Function to remove the HelcimPay.js iframe
  const removeHelcimPayIframe = () => {
    // Always reset payment loading state when iframe is removed
    setPaymentLoading(false);

    const frame = document.getElementById('helcimPayIframe');
    if (frame instanceof HTMLIFrameElement) {
      frame.remove();
    }
  };

  // Add event listener to iframe load
  useEffect(() => {
    const handleIframeLoaded = () => {
      setPaymentLoading(false);
    };

    window.addEventListener('message', (event) => {
      // Check if iframe is loaded and visible
      if (
        event.data &&
        typeof event.data === 'object' &&
        event.data.eventStatus === 'READY'
      ) {
        handleIframeLoaded();
      }
    });

    return () => {
      // Cleanup if needed
    };
  }, []);

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
          You&apos;ll be using Helcim&apos;s secure payment system to complete
          your purchase. Your payment information is securely processed by
          Helcim.
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
          onClick={openHelcimPayModal}
          disabled={paymentLoading}
          className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center'
        >
          {paymentLoading ? (
            <>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
              Processing...
            </>
          ) : (
            'Pay Now'
          )}
        </button>
      </div>
    </div>
  );
};

export default HelcimPayment;
