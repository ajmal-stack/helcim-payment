import Image from 'next/image';
import { useState } from 'react';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  onAddToCart: (id: number) => void;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  description,
  onAddToCart,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className='bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='relative h-48 overflow-hidden'>
        <Image
          src={image}
          alt={name}
          fill
          className={`object-cover transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
      </div>
      <div className='p-4'>
        <h3 className='text-lg font-semibold mb-1 text-gray-800'>{name}</h3>
        <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{description}</p>
        <div className='flex justify-between items-center'>
          <span className='text-lg font-bold text-gray-900'>
            ${price.toFixed(2)} USD
          </span>
          <button
            onClick={() => onAddToCart(id)}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300'
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
