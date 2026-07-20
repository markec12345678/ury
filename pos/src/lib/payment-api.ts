import { call } from './frappe-sdk-retry';
import { getErrorMessage } from './error-utils';

interface PaymentMode {
  mode_of_payment: string;
  opening_amount: number;
}

interface PaymentModeResponse {
  message: PaymentMode[];
}

interface CachedPaymentModes {
  data: string[];
  timestamp: number;
}

const CACHE_KEY = 'payment_modes';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const getPaymentModes = async (): Promise<string[]> => {
  // Check session storage first with TTL
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const parsed: CachedPaymentModes = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.data;
      }
      // Cache expired — remove stale entry
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      sessionStorage.removeItem(CACHE_KEY);
    }
  }

  try {
    const response = await call.get<PaymentModeResponse>("ury.ury_pos.api.getModeOfPayment");

    const paymentModes = (response.message || []).map((mode:PaymentMode) => mode.mode_of_payment);

    // Cache in session storage with timestamp
    const cacheEntry: CachedPaymentModes = {
      data: paymentModes,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));

    return paymentModes;
  } catch (error) {
    throw new Error(`Failed to fetch payment modes: ${getErrorMessage(error)}`);
  }
};
