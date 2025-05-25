import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiProcessPayment } from '../../services/api';
import type { PaymentCreateDto, PaymentResponseDto } from '../../types';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51RPunM2Ul6R6JmWFiFWfgFNITsUpihel2qkt6MQClIWA2u8ilXe2DztM1IPluv5U49O3PsAXaUXTIAWDEUjlAIKV006z4qIPrA');

interface PaymentFormProps {
  bookingId: number | string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentFormWrapper: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  bookingId,
  amount,
  onSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Generate a return URL for redirect-based payment methods, even if we don't use them
  // The backend still requires this parameter
  const returnUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/payment-return` 
    : 'https://skillsyncsa.netlify.app/payment-return';

  const paymentMutation = useMutation({
    mutationFn: (paymentData: PaymentCreateDto) => 
      apiProcessPayment(bookingId, paymentData),
    onSuccess: (response: PaymentResponseDto) => {
      // Handle redirect-based payment methods if needed
      if (response.redirectUrl) {
        window.location.href = response.redirectUrl;
      } else {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      setProcessing(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }
    
    // Validate that card information is complete
    if (!cardComplete) {
      setError('Please complete your card information');
      return;
    }
    
    setProcessing(true);
    setError('');
    
    try {
      // Create a payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Process payment with our API - use only returnUrl for now
      // (disableRedirectPayments conflicts with confirmation_method in backend)
      const paymentData: PaymentCreateDto = {
        paymentMethodId: paymentMethod.id,
        returnUrl: returnUrl // Include returnUrl for backend compatibility
        // Removed disableRedirectPayments due to Stripe API conflict
      };
      
      await paymentMutation.mutateAsync(paymentData);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment processing');
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
      <p className="mb-6 text-gray-600">
        Amount to pay: <span className="font-semibold">${amount.toFixed(2)}</span>
      </p>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Card Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Information
            </label>
            <div className="border border-gray-300 rounded-md p-3 focus-within:ring-primary-500 focus-within:border-primary-500">
              <CardElement 
                options={{
                  ...cardElementOptions,
                  hidePostalCode: true
                }}
                onChange={(e: any) => setCardComplete(e.complete)}
              />
            </div>
          </div>
          
          <p className="mt-1 text-xs text-gray-500">
            Test card: 4242 4242 4242 4242 | Exp: Any future date | CVC: Any 3 digits
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || processing}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-75"
          >
            {processing ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentFormWrapper; 