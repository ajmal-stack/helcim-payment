# Helcim Payment Integration Guide

This guide provides step-by-step instructions for implementing Helcim payment processing in a Next.js application.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Helcim merchant account
- Helcim API credentials
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

### 1. Prerequisites

- A Vercel account (create one at vercel.com)
- Git repository with your project
- Helcim API credentials ready

### 2. Prepare Your Project

1. **Install Vercel CLI** (optional but recommended)

```bash
npm install -g vercel
```

2. **Configure Environment Variables**
   You'll need to set up the following environment variables in Vercel:

- `HELCIM_API_TOKEN`
- `NEXT_PUBLIC_HELCIM_TERMINAL_ID`
- `NEXT_PUBLIC_API_BASE_URL`

### 3. Deploy to Vercel

#### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure your project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables:
   - Go to Project Settings > Environment Variables
   - Add each required environment variable
6. Deploy

#### Option 2: Deploy via CLI

1. Login to Vercel:

```bash
vercel login
```

2. Deploy the project:

```bash
vercel
```

3. Follow the CLI prompts to configure your project

### 4. Post-Deployment Steps

1. **Verify Environment Variables**

- Check if all environment variables are properly set
- Verify they're accessible in your application

2. **Update API Base URL**

- Update `NEXT_PUBLIC_API_BASE_URL` to match your Vercel deployment URL
- Format: `https://your-project.vercel.app/api`

3. **Test Payment Flow**

- Make a test purchase
- Verify success/failure flows
- Check webhook functionality

### 5. Production Considerations

1. **SSL/HTTPS**

- Vercel automatically provides SSL certificates
- All endpoints will be served over HTTPS

2. **Domain Configuration**

- Add a custom domain in Vercel dashboard
- Update API base URL if using custom domain

3. **Monitoring**

- Set up Vercel Analytics (optional)
- Configure error monitoring
- Set up payment logging

### 6. Troubleshooting

Common deployment issues:

1. **Build Failures**

- Check build logs in Vercel dashboard
- Verify all dependencies are properly listed in package.json
- Check for environment variable references in build process

2. **Runtime Errors**

- Check Function Logs in Vercel dashboard
- Verify environment variables are properly set
- Check API endpoint responses

3. **Payment Issues**

- Verify Helcim API credentials
- Check CORS settings
- Validate webhook endpoints

### 7. Maintenance

1. **Updates**

- Enable automatic deployments
- Configure preview deployments for pull requests
- Set up branch protections

2. **Monitoring**

- Review Vercel analytics
- Monitor API performance
- Track error rates

3. **Scaling**

- Vercel automatically handles scaling
- Monitor usage metrics
- Adjust plans as needed

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
