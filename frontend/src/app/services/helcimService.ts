import axios from 'axios';

// Make sure this URL matches the backend's API endpoint structure
const API_BASE_URL = 'http://localhost:5000/api/helcim';

interface PaymentInitializeRequest {
  amount: number;
  customerCode?: string;
  invoiceNumber?: string;
  returnUrl: string;
}

interface PaymentResponse {
  success: boolean;
  helcimPayId?: string;
  paymentUrl?: string;
  transactionId?: string;
  responseCode?: string;
  responseMessage?: string;
  error?: string;
  details?: string;
}

/**
 * Initialize a payment with Helcim
 *
 * @param data Payment request data
 * @returns Response with payment URL and ID
 */
export const initializePayment = async (
  data: PaymentInitializeRequest
): Promise<PaymentResponse> => {
  try {
    // Ensure the return URL is absolute
    if (!data.returnUrl) {
      data.returnUrl = window.location.origin + '/checkout/success';
    } else if (!data.returnUrl.startsWith('http')) {
      data.returnUrl = window.location.origin + data.returnUrl;
    }

    console.log('Initializing payment with data:', data);

    const response = await axios.post(
      `${API_BASE_URL}/initialize-payment`,
      data
    );

    console.log('Payment initialization response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Payment initialization error:', error);

    if (axios.isAxiosError(error) && error.response) {
      // Handle axios errors with response
      const errorMessage =
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'error' in error.response.data
          ? String(error.response.data.error)
          : 'Payment initialization failed';

      console.error('API error response:', error.response.data);

      return {
        success: false,
        error: errorMessage,
        details: error.response.data?.details || error.message,
      };
    }

    // Handle other errors
    let errorMessage = 'Network error occurred while processing payment';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Verify the status of a payment
 *
 * @param helcimPayId Payment ID to check
 * @returns Payment status response
 */
export const verifyPaymentStatus = async (
  helcimPayId: string
): Promise<PaymentResponse> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/payment-status/${helcimPayId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Handle axios errors with response
      const errorMessage =
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'error' in error.response.data
          ? String(error.response.data.error)
          : 'Failed to verify payment status';

      return {
        success: false,
        error: errorMessage,
        details: error.response.data?.details || error.message,
      };
    }

    // Handle other errors
    let errorMessage = 'Network error occurred while verifying payment';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Generate a unique invoice number
 *
 * @returns Unique invoice number string
 */
export const generateInvoiceNumber = (): string => {
  // Generate a unique invoice number (timestamp + random number)
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

/**
 * Handle the return from Helcim payment
 * Extracts status and transaction ID from URL parameters
 *
 * @returns Object with status and transaction ID
 */
export const handlePaymentReturn = (): {
  status: string;
  transactionId?: string;
} => {
  // Get URL parameters from the current URL
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status') || 'unknown';
  const transactionId = urlParams.get('txnId') || undefined;

  return {
    status,
    transactionId,
  };
};
