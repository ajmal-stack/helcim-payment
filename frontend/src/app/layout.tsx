import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from './context/CartContext';

const geistSans = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TechShop - Electronics Store',
  description: 'Shop the latest electronics and tech products',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.className} antialiased`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
