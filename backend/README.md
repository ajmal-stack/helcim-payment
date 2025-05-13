# Helcim Backend API

A Node.js Express backend for the Helcim application.

## Setup

1. Install dependencies:

```
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/helcim
NODE_ENV=development
HELCIM_API_URL=https://api.helcim.com/v2
HELCIM_ACCOUNT_ID=YOUR_HELCIM_ACCOUNT_ID
HELCIM_API_TOKEN=YOUR_HELCIM_API_TOKEN
```

## Running the Server

For development with hot reload:

```
npm run dev
```

For production:

```
npm start
```

## API Endpoints

### Base URL

- `GET /` - Welcome message

### Status

- `GET /api/status` - API status check

### Examples

- `GET /api/examples` - Get all examples
- `GET /api/examples/:id` - Get a specific example
- `POST /api/examples` - Create a new example
- `PUT /api/examples/:id` - Update an example
- `DELETE /api/examples/:id` - Delete an example

### Helcim Payments (New Integration)

- `POST /api/helcim/initialize-payment` - Initialize a payment session
- `POST /api/helcim/process-purchase` - Process a direct purchase transaction
- `GET /api/helcim/payment-status/:helcimPayId` - Check payment status
- `POST /api/helcim/complete-payment/:helcimPayId` - Complete a payment (for testing)

## Helcim Payment Integration

This API integrates with Helcim for payment processing. To use the Helcim payment features:

1. Set your Helcim API credentials in the `.env` file:

```
HELCIM_API_URL=https://api.helcim.com/v2
HELCIM_ACCOUNT_ID=YOUR_HELCIM_ACCOUNT_ID
HELCIM_API_TOKEN=YOUR_HELCIM_API_TOKEN
```

2. Initialize a payment using the `/api/helcim/initialize-payment` endpoint with a POST request containing:

```json
{
  "amount": 99.99,
  "customerCode": "CUST-001",
  "invoiceNumber": "INV-001"
}
```

3. The initialize-payment endpoint returns:

   - `helcimPayId`: Unique ID for this payment session
   - `paymentUrl`: URL to redirect the customer to complete payment

4. You can check the payment status using:

   - `GET /api/helcim/payment-status/:helcimPayId`

5. For direct card processing (not recommended for production), use:
   - `POST /api/helcim/process-purchase`

```json
{
  "amount": 99.99,
  "currency": "CAD",
  "cardNumber": "4111111111111111",
  "cardExpiry": "12/25",
  "cardCVV": "123",
  "customerCode": "CUST-001",
  "invoiceNumber": "INV-001",
  "description": "Test purchase"
}
```

For more information on the Helcim API, visit the [Helcim API Documentation](https://devdocs.helcim.com/reference/purchase).

## Testing the Helcim Integration

The mock payment flow is available for testing at:

```
http://localhost:5000/mock-payment.html?id=YOUR_PAYMENT_ID
```

### Running Tests

To run the tests, use the following command:

```bash
npm test
```

This will run all tests with Jest and generate a coverage report.

For running specific test files:

```bash
# Run controller tests only
npm test -- tests/controllers/helcimController.test.js

# Run integration tests only
npm test -- tests/integration/helcim.integration.test.js
```

### Test Coverage

The tests aim to cover all aspects of the Helcim integration:

1. **Controller Tests**: Test the payment initialization logic and error handling
2. **Route Tests**: Test the API endpoints and their responses
3. **Config Tests**: Ensure the Helcim configuration is properly set up
4. **Integration Tests**: End-to-end tests of the payment flow with mocked Helcim API responses

The coverage report will be generated in the `coverage` directory.
