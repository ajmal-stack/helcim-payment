'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Image from 'next/image';
import HelcimPayment from '../components/HelcimPayment';

export default function CheckoutPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showPaymentForm, setShowPaymentForm] = useState(true);
  const [showHelcimPayment, setShowHelcimPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing in a field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required';

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Generate a random order ID
    const randomOrderId = `ORD-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;
    setOrderId(randomOrderId);

    // Show Helcim payment component
    setShowPaymentForm(false);
    setShowHelcimPayment(true);
  };

  const handlePaymentError = (error: string) => {
    // Ensure error is a string
    const errorMessage =
      typeof error === 'string'
        ? error
        : 'An error occurred during payment processing';

    setPaymentError(errorMessage);
    setShowHelcimPayment(false);
    setShowPaymentForm(true);
  };

  const handlePaymentCancel = () => {
    setShowHelcimPayment(false);
    setShowPaymentForm(true);
  };

  // Handle item quantity change
  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='text-center py-16'>
            <h2 className='text-2xl font-bold mb-4'>Your cart is empty</h2>
            <p className='text-gray-600 mb-8'>
              Add some products to your cart to checkout
            </p>
            <button
              onClick={() => router.push('/')}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors duration-300'
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className='text-3xl font-bold mb-8'>Checkout</h1>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Order Summary */}
          <div>
            <h2 className='text-xl font-semibold mb-4'>Order Summary</h2>
            <div className='bg-gray-50 rounded-lg p-6'>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center py-4 border-b border-gray-200'
                >
                  <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md'>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='ml-4 flex-1'>
                    <h3 className='text-base font-medium text-gray-900'>
                      {item.name}
                    </h3>
                    <p className='mt-1 text-sm text-gray-500'>
                      ${item.price.toFixed(2)} USD
                    </p>
                  </div>
                  <div className='flex items-center'>
                    <button
                      className='text-gray-500 focus:outline-none'
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                    >
                      <span className='sr-only'>Decrease quantity</span>
                      <svg
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M20 12H4'
                        />
                      </svg>
                    </button>
                    <span className='mx-2 text-gray-700'>{item.quantity}</span>
                    <button
                      className='text-gray-500 focus:outline-none'
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                    >
                      <span className='sr-only'>Increase quantity</span>
                      <svg
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                        />
                      </svg>
                    </button>
                    <button
                      className='ml-4 text-red-500 hover:text-red-700'
                      onClick={() => removeFromCart(item.id)}
                    >
                      <span className='sr-only'>Remove</span>
                      <svg
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v10M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3'
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <div className='mt-6 space-y-2'>
                <div className='flex justify-between text-sm'>
                  <p>Subtotal</p>
                  <p>${cartTotal.toFixed(2)} USD</p>
                </div>
                <div className='flex justify-between text-sm'>
                  <p>Shipping</p>
                  <p>$0.00 USD</p>
                </div>
                {/* <div className='flex justify-between text-sm'>
                  <p>Tax</p>
                  <p>${(cartTotal * 0.08).toFixed(2)} USD</p>
                </div> */}
                <div className='border-t border-gray-200 pt-2 flex justify-between font-semibold'>
                  <p>Total</p>
                  <p>${cartTotal.toFixed(2)} USD</p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form or Helcim Payment */}
          <div>
            {showPaymentForm && (
              <>
                <h2 className='text-xl font-semibold mb-4'>
                  Shipping Information
                </h2>

                {paymentError && (
                  <div className='bg-red-50 border border-red-200 p-4 rounded-md mb-6'>
                    <p className='text-red-700'>{paymentError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='firstName'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        First Name
                      </label>
                      <input
                        type='text'
                        id='firstName'
                        name='firstName'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.firstName
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {formErrors.firstName && (
                        <p className='mt-1 text-sm text-red-600'>
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor='lastName'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Last Name
                      </label>
                      <input
                        type='text'
                        id='lastName'
                        name='lastName'
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.lastName
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {formErrors.lastName && (
                        <p className='mt-1 text-sm text-red-600'>
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='email'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Email
                    </label>
                    <input
                      type='email'
                      id='email'
                      name='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.email && (
                      <p className='mt-1 text-sm text-red-600'>
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='address'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Address
                    </label>
                    <input
                      type='text'
                      id='address'
                      name='address'
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        formErrors.address
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.address && (
                      <p className='mt-1 text-sm text-red-600'>
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label
                        htmlFor='city'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        City
                      </label>
                      <input
                        type='text'
                        id='city'
                        name='city'
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.city ? 'border-red-500' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {formErrors.city && (
                        <p className='mt-1 text-sm text-red-600'>
                          {formErrors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor='state'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        State
                      </label>
                      <input
                        type='text'
                        id='state'
                        name='state'
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.state
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {formErrors.state && (
                        <p className='mt-1 text-sm text-red-600'>
                          {formErrors.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor='zipCode'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        ZIP Code
                      </label>
                      <input
                        type='text'
                        id='zipCode'
                        name='zipCode'
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.zipCode
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {formErrors.zipCode && (
                        <p className='mt-1 text-sm text-red-600'>
                          {formErrors.zipCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='pt-4'>
                    <button
                      type='submit'
                      className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors duration-300 font-medium'
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </form>
              </>
            )}

            {showHelcimPayment && (
              <div>
                <h2 className='text-xl font-semibold mb-4'>Payment</h2>
                <HelcimPayment
                  amount={cartTotal}
                  orderId={orderId}
                  customerData={{
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                  }}
                  returnUrl={`${window.location.origin}/checkout/success`}
                  homepageUrl={window.location.origin}
                  onPaymentError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
