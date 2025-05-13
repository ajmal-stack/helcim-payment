import { useState } from 'react';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: 'Premium Headphones',
    price: 199,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500',
    description:
      'High-quality noise cancelling headphones with premium sound quality.',
  },
  {
    id: 2,
    name: 'Smartwatch',
    price: 249,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500',
    description:
      'Advanced smartwatch with health tracking and notification features.',
  },
  {
    id: 3,
    name: 'Wireless Keyboard',
    price: 89,
    image:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=500',
    description:
      'Ergonomic wireless keyboard with customizable keys and long battery life.',
  },
  {
    id: 4,
    name: 'Bluetooth Speaker',
    price: 129,
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=500',
    description:
      'Portable Bluetooth speaker with 360° sound and waterproof design.',
  },
  {
    id: 5,
    name: 'Wireless Mouse',
    price: 59,
    image:
      'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?q=80&w=500',
    description:
      'Precision wireless mouse with customizable DPI settings and ergonomic design.',
  },
  {
    id: 6,
    name: 'HD Webcam',
    price: 79,
    image:
      'https://images.unsplash.com/photo-1576053671249-57b8854b614a?q=80&w=500',
    description: 'Full HD webcam for crystal clear video calls and streaming.',
  },
];

export default function ProductList() {
  const { addToCart } = useCart();
  const [products] = useState(mockProducts);

  const handleAddToCart = (id: number) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      addToCart(product);
    }
  };

  return (
    <div className='py-8'>
      <h2 className='text-2xl font-bold mb-6 text-center'>Featured Products</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
            description={product.description}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}
