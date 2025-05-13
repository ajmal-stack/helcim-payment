# Helcim Payment Integration

## Project Overview

This project implements a payment processing solution using Helcim's API. It provides a modern, secure interface for accepting payments.

## Technology Stack

- **Frontend**: React.js, Next.js
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **API Integration**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Testing**: Jest, React Testing Library

## Project Structure

```
helcim-payment/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── forms/       # Payment form components
│   │   ├── ui/          # UI elements
│   │   └── layout/      # Layout components
│   ├── pages/           # Next.js pages
│   ├── api/             # API routes
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── services/        # API service functions
│   ├── context/         # React context providers
│   └── styles/          # Global styles
├── tests/               # Test files
├── .env.example         # Example environment variables
├── .eslintrc.js         # ESLint configuration
├── jest.config.js       # Jest configuration
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Project dependencies
```

## Installation

```bash
npm install
# or
yarn add
```

## Run Command

```bash
npm run dev
```

## Setup Process

### 1. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
HELCIM_ACCOUNT_ID=your_account_id
HELCIM_API_TOKEN=your_api_token
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. Configure the Application

Create a configuration file (e.g., `config.js`) in your project:

```javascript
// config.js
const config = {
  apiCredentials: {
    accountId: process.env.HELCIM_ACCOUNT_ID,
    apiToken: process.env.HELCIM_API_TOKEN,
    environment:
      process.env.NODE_ENV === 'production' ? 'production' : 'development',
  },
  apiEndpoints: {
    payments: '/api/payments',
    tokens: '/api/tokens',
    customers: '/api/customers',
  },
};

export default config;
```

### 3. Install Dependencies and Run

After installing dependencies, start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

### 4. Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run linting

## License

MIT
