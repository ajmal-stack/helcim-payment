const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug environment variables
console.log(
  'Environment variables loaded from:',
  path.resolve(__dirname, '../.env')
);
console.log('HELCIM_API_URL:', process.env.HELCIM_API_URL);
console.log('HELCIM_API_TOKEN exists:', !!process.env.HELCIM_API_TOKEN);

// Check if required environment variables are set
const HELCIM_API_URL =
  process.env.HELCIM_API_URL || 'https://api.helcim.com/v2';
const HELCIM_API_TOKEN = process.env.HELCIM_API_TOKEN;

// Store active payment sessions
const activePayments = new Map();

/**
 * Initialize a payment session with Helcim
 */
exports.initializePayment = async (req, res) => {
  try {
    console.log('Initialize payment request received:', req.body);
    const { amount, customerCode, invoiceNumber, returnUrl, homepageUrl } =
      req.body;

    // Validate required fields
    if (!amount || !returnUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount and returnUrl are required',
      });
    }

    // Check if API token is set
    if (!HELCIM_API_TOKEN) {
      console.error('Helcim API token is not properly configured in .env file');
      console.error(
        'HELCIM_API_TOKEN length:',
        HELCIM_API_TOKEN ? HELCIM_API_TOKEN.length : 0
      );
      console.error('HELCIM_API_URL:', HELCIM_API_URL);

      return res.status(500).json({
        success: false,
        error: 'Helcim API token is not configured',
      });
    }

    // Generate a unique ID for this payment session
    const helcimPayId = `helcim-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    try {
      console.log('Initializing Helcim payment with these details:', {
        amount: parseFloat(amount).toFixed(2),
        returnUrl,
        homepageUrl,
      });

      console.log('Using API Token Authorization');
      console.log('Homepage URL provided:', homepageUrl);

      // Build request payload according to latest Helcim API documentation
      const payload = {
        paymentType: 'purchase',
        amount: parseFloat(amount),
        currency: 'USD',
        paymentMethod: 'cc-ach',
        hasConvenienceFee: 1,
        hideExistingPaymentDetails: 1,
        setAsDefaultPaymentMethod: 1,
        digitalWallet: '{"google-pay": 1}',
        displayContactFields: 1,
        test: true,
        returnUrl: returnUrl,
        cancelUrl: returnUrl,
        confirmationScreen: false,
        displayContactFields: 1,
      };

      // Add optional fields if they're provided
      if (customerCode) {
        payload.customerCode = customerCode;
      }

      if (invoiceNumber) {
        payload.invoiceNumber = invoiceNumber;
      }

      // Add optional billing contact if we have customer data
      if (req.body.customerData) {
        const { firstName, lastName, email } = req.body.customerData;
        if (firstName && lastName) {
          payload.billingContact = {
            name: `${firstName} ${lastName}`,
            email: email || 'test@example.com',
          };
        }
      }

      console.log('Full request payload:', JSON.stringify(payload, null, 2));
      console.log(
        'Making request to URL:',
        `${HELCIM_API_URL}/helcim-pay/initialize`
      );

      // Create API request options
      const options = {
        method: 'POST',
        url: `${HELCIM_API_URL}/helcim-pay/initialize`,
        headers: {
          accept: 'application/json',
          'api-token': HELCIM_API_TOKEN,
          'content-type': 'application/json',
        },
        data: payload,
      };

      // Make the request
      const response = await axios.request(options);

      console.log(
        'Helcim API response:',
        JSON.stringify(response.data, null, 2)
      );

      // Construct the Helcim payment URL with the checkout token
      const helcimPaymentUrl = `https://secure.helcim.app/helcim-pay/${response.data.checkoutToken}`;
      console.log('Constructed Helcim payment URL:', helcimPaymentUrl);

      // Store payment info for status checks
      activePayments.set(helcimPayId, {
        amount,
        status: 'pending',
        createdAt: new Date(),
        checkoutToken: response.data.checkoutToken,
        secretToken: response.data.secretToken,
        paymentUrl: helcimPaymentUrl,
        homepageUrl: homepageUrl || returnUrl,
      });

      console.log(
        'Stored payment data with homepageUrl:',
        homepageUrl || returnUrl
      );

      // Return the checkoutToken for HelcimPay.js modal
      return res.status(200).json({
        success: true,
        helcimPayId,
        checkoutToken: response.data.checkoutToken,
        paymentUrl: helcimPaymentUrl,
        message: 'Payment initialized successfully',
      });
    } catch (apiError) {
      console.error('Helcim API error details:');
      console.error('Error message:', apiError.message);

      if (apiError.response) {
        console.error('Status code:', apiError.response.status);
        console.error(
          'Response data:',
          JSON.stringify(apiError.response.data, null, 2)
        );
        console.error('Response headers:', apiError.response.headers);
      } else if (apiError.request) {
        console.error('No response received, request was:', apiError.request);
      }

      return res.status(400).json({
        success: false,
        error:
          apiError.response?.data?.errors ||
          'Error connecting to Helcim payment service',
        details: apiError.message,
        fullError: apiError.response?.data,
      });
    }
  } catch (error) {
    console.error('Error initializing payment:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while initializing payment',
      details: error.message,
    });
  }
};

/**
 * Process a direct purchase transaction with Helcim
 */
exports.processPurchase = async (req, res) => {
  try {
    const {
      amount,
      currency = 'USD',
      cardNumber,
      cardExpiry,
      cardCVV,
      customerCode,
      invoiceNumber,
      billingAddress = {},
      description,
    } = req.body;

    // Validate required fields
    if (!amount || !cardNumber || !cardExpiry || !cardCVV) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment information',
      });
    }

    // Parse expiry date (MM/YY format)
    const [expiryMonth, expiryYear] = cardExpiry.split('/');
    if (!expiryMonth || !expiryYear) {
      return res.status(400).json({
        success: false,
        error: 'Invalid card expiry format. Please use MM/YY',
      });
    }

    try {
      // Make request to Helcim API for purchase transaction
      const response = await axios.post(
        `${HELCIM_API_URL}/payment/purchase`,
        {
          amount: parseFloat(amount),
          currency,
          cardNumber: cardNumber.replace(/\s+/g, ''),
          cardExpiry: {
            month: expiryMonth,
            year: `20${expiryYear}`,
          },
          cardCVV,
          customerCode,
          invoiceNumber,
          test: true,
          description: description || `Invoice: ${invoiceNumber}`,
          billingAddress,
        },
        {
          headers: {
            'api-token': HELCIM_API_TOKEN,
            'content-type': 'application/json',
            accept: 'application/json',
          },
        }
      );

      return res.status(200).json({
        success: true,
        transactionId: response.data.transactionId,
        responseCode: response.data.responseCode,
        responseMessage: response.data.responseMessage,
        avsResponse: response.data.avsResponse,
        cvvResponse: response.data.cvvResponse,
      });
    } catch (apiError) {
      console.error(
        'Helcim API error:',
        apiError.response?.data || apiError.message
      );

      return res.status(500).json({
        success: false,
        error: apiError.response?.data?.message || 'Payment processing failed',
        details: apiError.message,
      });
    }
  } catch (error) {
    console.error('Error processing purchase:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing the purchase',
      details: error.message,
    });
  }
};

/**
 * Check payment status with Helcim
 */
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { helcimPayId } = req.params;

    if (!helcimPayId) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID is required',
      });
    }

    // Check if payment exists in our local store
    if (!activePayments.has(helcimPayId)) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    const payment = activePayments.get(helcimPayId);
    console.log('Checking payment status for:', helcimPayId, payment);

    // We need both checkout and secret tokens to verify the payment
    if (!payment.checkoutToken || !payment.secretToken) {
      return res.status(400).json({
        success: false,
        status: 'pending',
        error: 'Missing tokens for payment verification',
      });
    }

    try {
      // Make request to verify payment status
      const response = await axios.get(
        `${HELCIM_API_URL}/helcim-pay/verify/${payment.checkoutToken}`,
        {
          headers: {
            'api-token': HELCIM_API_TOKEN,
            'secret-token': payment.secretToken,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Payment status response:', response.data);

      // Update local payment status based on Helcim response
      if (response.data.paid && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.transactionId = response.data.transactionId || response.data.id;
        activePayments.set(helcimPayId, payment);
      }

      // Return redirect URL if payment is completed
      const redirectUrl = response.data.paid
        ? payment.homepageUrl || window.location.origin
        : '';
      console.log('Setting redirect URL to:', redirectUrl);
      console.log('Payment homepageUrl:', payment.homepageUrl);
      console.log('Full payment data:', JSON.stringify(payment, null, 2));

      // Ensure we have a valid redirect URL
      const finalRedirectUrl =
        redirectUrl || window.location.origin || 'http://localhost:3000';
      console.log('Final redirect URL:', finalRedirectUrl);

      return res.status(200).json({
        success: !!response.data.paid,
        status: response.data.paid ? 'completed' : 'pending',
        transactionId: response.data.transactionId || response.data.id || null,
        redirectUrl: finalRedirectUrl,
        timestamp: new Date().getTime(),
      });
    } catch (apiError) {
      console.error(
        'Helcim API error:',
        apiError.response?.data || apiError.message
      );
      return res.status(400).json({
        success: false,
        status: payment.status,
        error: 'Could not verify payment status with Helcim',
        details: apiError.message,
      });
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while checking payment status',
      details: error.message,
    });
  }
};

/**
 * Verify a payment completed through HelcimPay.js
 */
exports.verifyHelcimPayment = async (req, res) => {
  try {
    console.log('Verifying HelcimPay.js payment:', req.body);

    const { transactionData } = req.body;

    if (!transactionData || !transactionData.data) {
      return res.status(400).json({
        success: false,
        error: 'Missing transaction data',
      });
    }

    // Extract relevant data from the transaction
    const transactionDetails = transactionData.data;
    const { transactionId, amount, status } = transactionDetails;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction data - missing transaction ID',
      });
    }

    // For now, we'll assume the transaction is valid if it has a transaction ID
    // and the status field indicates approval (for credit card transactions)
    const isApproved = transactionDetails.status === 'APPROVED';

    return res.status(200).json({
      success: isApproved,
      transactionId,
      amount,
      message: isApproved
        ? 'Payment verification successful'
        : 'Payment verification failed',
    });
  } catch (error) {
    console.error('Error verifying HelcimPay.js payment:', error);
    return res.status(500).json({
      success: false,
      error: 'Error verifying payment: ' + error.message,
    });
  }
};
