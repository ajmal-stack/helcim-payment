# Helcim Payment Integration Guide

This guide provides step-by-step instructions for implementing Helcim payment processing in a Next.js application.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Helcim merchant account
- Helcim API credentials
  - Account ID
  - API Token
  - Terminal ID (for HelcimPay.js)

## Project Setup

1. **Create a Next.js Project** (skip if adding to existing project)

```bash
npx create-next-app@latest my-helcim-app
cd my-helcim-app
```

2. **Install Required Dependencies**

```bash
npm install @types/node @types/react @types/react-dom typescript
# or
yarn add @types/node @types/react @types/react-dom typescript
```

3. **Environment Setup**

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_HELCIM_TERMINAL_ID=your_terminal_id
HELCIM_ACCOUNT_ID=your_account_id
HELCIM_API_TOKEN=your_api_token
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## Implementation Steps

### 1. Backend Setup

Create the following files in your project:

#### `src/app/api/helcim/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Initialize payment with Helcim
    const response = await fetch(
      'https://api.helcim.com/v2/payment/initialize',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.HELCIM_API_TOKEN}`,
        },
        body: JSON.stringify({
          accountId: process.env.HELCIM_ACCOUNT_ID,
          amount: data.amount,
          currency: 'USD',
          terminalId: process.env.NEXT_PUBLIC_HELCIM_TERMINAL_ID,
          returnUrl: data.returnUrl,
        }),
      }
    );

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
```

### 2. Frontend Components

#### Component Structure

```
src/
└── app/
    ├── components/
    │   └── HelcimPayment.tsx
    ├── services/
    │   └── helcimService.ts
    └── checkout/
        └── success/
            └── page.tsx
```

### 3. Integration Steps

1. **Add HelcimPayment Component to Your Checkout Page**

```tsx
import HelcimPayment from '../components/HelcimPayment';

export default function CheckoutPage() {
  return (
    <HelcimPayment
      amount={totalAmount}
      orderId={orderId}
      customerData={{
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      }}
      onPaymentError={(error) => console.error(error)}
      onCancel={() => console.log('Payment cancelled')}
    />
  );
}
```

2. **Configure Success Page Route**
   Make sure your `success/page.tsx` is properly configured to handle payment responses.

## Deployment Process

### 1. Pre-deployment Checklist

- [ ] Test payment flow in development environment
- [ ] Verify all environment variables are properly set
- [ ] Ensure proper error handling is in place
- [ ] Test success and failure scenarios
- [ ] Verify webhook endpoints (if used)

### 2. Production Environment Setup

1. **Set Production Environment Variables**

   - Set up environment variables in your hosting platform
   - Update API endpoints to use production URLs
   - Configure production Helcim credentials

2. **Build the Application**

```bash
npm run build
# or
yarn build
```

3. **Deploy to Your Hosting Platform**

#### Vercel Deployment

```bash
npm i -g vercel
vercel
```

#### Other Platforms

- Follow platform-specific deployment instructions
- Ensure SSL is enabled for secure payments
- Configure proper CORS settings if needed

### 3. Post-deployment Verification

1. **Test Live Integration**

   - Make a test purchase
   - Verify payment processing
   - Check success/failure redirects
   - Confirm webhook functionality

2. **Monitor and Logging**
   - Set up error monitoring
   - Configure payment logging
   - Set up alerts for failed transactions

## Security Considerations

1. **Environment Variables**

   - Never commit sensitive credentials
   - Use proper secret management
   - Rotate API keys periodically

2. **Data Handling**

   - Implement proper data sanitization
   - Use HTTPS for all API calls
   - Follow PCI compliance guidelines

3. **Error Handling**
   - Implement proper error logging
   - Handle edge cases gracefully
   - Provide user-friendly error messages

## Troubleshooting

Common issues and solutions:

1. **Payment Modal Not Loading**

   - Check HelcimPay.js script loading
   - Verify Terminal ID configuration
   - Check browser console for errors

2. **Payment Success Not Redirecting**

   - Verify success page route configuration
   - Check session storage handling
   - Validate response parsing

3. **API Errors**
   - Verify API credentials
   - Check request formatting
   - Validate webhook endpoints

## Testing

### 1. Test Cards

Use these test cards in development:

- Visa: 4242424242424242
- Mastercard: 5555555555554444
- Test CVV: 123
- Future expiry date

### 2. Test Scenarios

- Successful payment
- Declined payment
- Invalid card
- Cancelled payment
- Network errors

## Support and Resources

- [Helcim API Documentation](https://www.helcim.com/api/)
- [HelcimPay.js Documentation](https://www.helcim.com/helcimpay/)
- [Next.js Documentation](https://nextjs.org/docs)

## Maintenance

1. **Regular Updates**

   - Keep dependencies updated
   - Monitor Helcim API changes
   - Update security patches

2. **Monitoring**
   - Track failed payments
   - Monitor API response times
   - Check error logs regularly

## Version Control

```bash
git init
git add .
git commit -m "Initial Helcim integration"
git branch -M main
git remote add origin your-repository-url
git push -u origin main
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this integration in your projects.
