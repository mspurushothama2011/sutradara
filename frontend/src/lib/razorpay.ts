/**
 * Dynamically load Razorpay Standard Checkout SDK
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(false);
    }

    if ((window as any).Razorpay) {
      return resolve(true);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK, fallback to high-assurance simulation mode.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface LaunchRazorpayOptions {
  keyId: string;
  amount: number;
  currency: string;
  orderId: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
}

/**
 * Open Razorpay Standard Checkout Modal with Sutraಧಾರ Luxury Palette
 */
export async function launchRazorpayCheckout(options: LaunchRazorpayOptions): Promise<boolean> {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !(window as any).Razorpay) {
    return false;
  }

  try {
    const rzp = new (window as any).Razorpay({
      key: options.keyId,
      amount: options.amount,
      currency: options.currency || 'INR',
      name: 'Sutraಧಾರ Royal Handloom',
      description: options.description || 'Authentic Silk Handloom Acquisition',
      image: 'https://assets.sutradara.in/brand/emblem-gold.png',
      order_id: options.orderId,
      handler: function (response: any) {
        options.onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || '',
      },
      notes: options.notes || {},
      theme: {
        color: '#c9a84c',
        backdrop_color: 'rgba(13, 9, 6, 0.85)',
      },
      modal: {
        ondismiss: function () {
          if (options.onDismiss) {
            options.onDismiss();
          }
        },
      },
    });

    rzp.open();
    return true;
  } catch (err) {
    console.error('Failed to open Razorpay modal:', err);
    return false;
  }
}
