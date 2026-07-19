import React, { useState, useEffect, useRef } from 'react';
import { X, Percent, Coins } from 'lucide-react';
import { usePOSStore } from '../store/pos-store';
import { formatCurrency, roundMoney } from '../lib/utils';
import { Button, Input, Dialog, DialogContent } from './ui';
import { call } from '../lib/frappe-sdk-retry';
import { DEFAULT_PAYMENT_MODE } from '../data/order-types';
import { t } from '../i18n';
import { showToast } from './ui/toast';
import { getErrorMessage } from '../lib/error-utils';


interface PaymentDialogProps {
  onClose: () => void;
  grandTotal: number;
  roundedTotal: number;
  invoice: string;
  customer: string;
  posProfile: string;
  table: string | null;
  cashier: string;
  owner: string;
  fetchOrders: () => Promise<void>;
  clearSelectedOrder: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  onClose,
  grandTotal,
  roundedTotal,
  invoice,
  customer,
  posProfile,
  table,
  cashier,
  owner,
  fetchOrders,
  clearSelectedOrder
}) => {
  const { paymentModes, fetchPaymentModes, posProfile: storePosProfile } = usePOSStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountValue, setDiscountValue] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  // R39-FIX: Store the original user-entered percentage to avoid floating-point
  // precision loss when re-converting absolute discount back to percentage.
  // Previously: (appliedDiscount / grandTotal * 100) could differ from the
  // original discountValue due to floating-point arithmetic, causing the backend
  // to apply a slightly different discount than what the user intended.
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState<number>(0);
  const [paymentInputs, setPaymentInputs] = useState<{ [mode: string]: string }>({});
  const userEditedRef = useRef(false);

  useEffect(() => {
    userEditedRef.current = false;
  }, []);

  useEffect(() => {
    if (paymentModes.length === 0) fetchPaymentModes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate split payment total
  const payments = paymentModes
    .map((mode: string) => {
      const amount = parseFloat(paymentInputs[mode] || '');
      return amount > 0 ? { mode_of_payment: mode, amount } : null;
    })
    .filter(Boolean) as Array<{ mode_of_payment: string; amount: number }>;
  // R39-FIX: Use roundMoney at each accumulation step to prevent floating-point
  // drift when summing multiple payment amounts (e.g. 10.10 + 20.20 !== 30.30)
  const paymentsTotal = payments.reduce((sum, p) => roundMoney(sum + p.amount), 0);

  const handleApplyDiscount = () => {
    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      setError(t('errors.invalid_discount'));
      return;
    }
    if (value > 100) {
      setError(t('errors.discount_exceeds_max'));
      return;
    }
    const calculatedDiscount = roundMoney((grandTotal * value) / 100);
    setAppliedDiscount(calculatedDiscount);
    setAppliedDiscountPercent(value);
    setError(null);
  };

  // Order summary logic
  const subtotal = grandTotal;
  const adjustment = roundedTotal - grandTotal;
  const roundedAdjustment = Math.round(adjustment * 100) / 100;
  const totalDiscount = appliedDiscount;
  const discountedTotal = Math.max(0, subtotal - totalDiscount);
  // R36-FIX: Use Math.round for both paths — Math.ceil silently overcharges customers
  const finalTotal = Math.round(discountedTotal);
  const finalAdjustment = finalTotal - discountedTotal;
  const roundedFinalAdjustment = Math.round(finalAdjustment * 100) / 100;
  const showFinalAdjustment = Math.abs(roundedFinalAdjustment) > 0.001;

  useEffect(()=>{
    if (userEditedRef.current) return;
    const defaultPaymentModePresent=paymentModes.find((mode)=>mode===DEFAULT_PAYMENT_MODE)
    //only one payment mode should be present, then autofill the final amount, if not do not fill
    const otherPaymentModesNotEntered=Object.keys(paymentInputs).length<=1;
    if(finalTotal && paymentModes && DEFAULT_PAYMENT_MODE && defaultPaymentModePresent && otherPaymentModesNotEntered){
      //check if default payment mode is present in paymentModes (POS-R36-016: prevent infinite re-trigger)
      setPaymentInputs((prev)=>{
        const newValue = String(finalTotal);
        if (prev[DEFAULT_PAYMENT_MODE] === newValue) return prev; // prevent re-render
        return { ...prev, [DEFAULT_PAYMENT_MODE]: newValue };
      })
    }
  },[finalTotal,paymentModes]) // removed paymentInputs from deps

  // Helper to calculate remaining balance
  const getRemainingBalance = (currentId: string) => {
    // R40-FIX: Use roundMoney at each accumulation step to prevent
    // floating-point drift when summing multiple payment amounts.
    // Previously: reduce((sum, [_key, val]) => sum + (parseFloat(val) || 0), 0)
    // could produce values like 30.000000000000004 instead of 30.
    const totalEntered = Object.entries(paymentInputs)
      .filter(([id]) => id !== currentId)
      .reduce((sum, [_key, val]) => roundMoney(sum + (parseFloat(val) || 0)), 0);
    return Math.max(0, roundMoney(finalTotal - totalEntered));
  };

  // Handler for input focus to auto-fill remaining balance
  const handlePaymentInputFocus = (id: string) => {
    setPaymentInputs(inputs => {
      // Only auto-fill if the field is empty or zero
      if (!inputs[id] || parseFloat(inputs[id]) === 0) {
        const remaining = getRemainingBalance(id);
        return { ...inputs, [id]: remaining > 0 ? String(remaining) : '' };
      }
      return inputs;
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await call.post('ury.ury.doctype.ury_order.ury_order.make_invoice', {
        // R39-FIX: Send the original user-entered percentage instead of re-converting
        // the absolute discount back to a percentage, which loses floating-point precision.
        additionalDiscount: appliedDiscountPercent > 0 ? appliedDiscountPercent : null,
        cashier,
        customer,
        invoice,
        owner,
        payments,
        pos_profile: posProfile,
        table,
      });
      showToast.success(t('success.payment_successful'));
      await fetchOrders();
      clearSelectedOrder();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent variant="xlarge" className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row p-0" showCloseButton={false}>
        {/* Left Column - Discount and Payment Mode */}
        <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('payment.title')}</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Discount Section (conditional) */}
          {storePosProfile?.enable_discount === 1 && (
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Percent className="w-5 h-5" />
                {t('payment.apply_discount')}
              </h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={t('payment.discount_placeholder')}
                  size="sm"
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyDiscount}
                  variant="default"
                  size="sm"
                >
                  {t('common.apply')}
                </Button>
              </div>
            </div>
          )}

          {/* Payment Methods Section - Split Payment */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">{t('payment.payment_methods')}</h3>
            <div className="grid grid-cols-1 gap-3">
              {paymentModes.map((mode: string) => {
                return (
                  <div key={mode} className="flex items-center gap-3">
                    <span className="w-24 font-medium">{mode}</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentInputs[mode] || ''}
                      onChange={e => { userEditedRef.current = true; setPaymentInputs(inputs => ({ ...inputs, [mode]: e.target.value })); }}
                      onFocus={() => handlePaymentInputFocus(mode)}
                      placeholder={t('payment.amount_placeholder')}
                      className="flex-1"
                      size="sm"
                      disabled={isProcessing}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="font-medium">{t('payment.total_entered')}</span>
              <span className={'text-green-600 font-semibold flex items-center gap-1'}>
                {formatCurrency(paymentsTotal)} / {formatCurrency(finalTotal)}
                {paymentsTotal > finalTotal && (
                  <span className="text-yellow-700 font-semibold">
                    <Coins className="inline w-4 h-4 ml-1 text-yellow-500" />
                    <span className="text-yellow-500 font-bold ml-1">{formatCurrency(paymentsTotal - finalTotal)}</span>
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary and Pay Button */}
        <div className="md:w-1/2 p-6 overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Order Summary */}
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-semibold">{t('payment.order_summary')}</h3>
            <div className="space-y-2 text-sm">
              {/* Subtotal (Grand Total) */}
              <div className="flex justify-between">
                <span className="text-gray-600">{t('payment.subtotal')}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {/* Discount */}
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('payment.discount')}</span>
                  <span>-{formatCurrency(appliedDiscount)}</span>
                </div>
              )}
              {/* Adjustment (if any) */}
              {showFinalAdjustment && (
                <div className="flex justify-between text-blue-600">
                  <span>{t('payment.adjustment')}</span>
                  <span>{roundedFinalAdjustment > 0 ? '+' : ''}{formatCurrency(roundedFinalAdjustment)}</span>
                </div>
              )}
              {/* Final Total (Rounded) */}
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t('payment.total')}</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing || payments.length === 0 || paymentsTotal < finalTotal}
            variant={isProcessing || payments.length === 0 || paymentsTotal < finalTotal ? "secondary" : "default"}
            className="w-full"
          >
            {isProcessing ? t('payment.processing') : t('payment.pay_button', { amount: formatCurrency(paymentsTotal > 0 ? paymentsTotal : finalTotal) })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog; 