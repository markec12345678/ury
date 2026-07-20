import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { OrderItem, usePOSStore } from '../store/pos-store';
import { cn, formatCurrency, roundMoney } from '../lib/utils';
import { Button, Dialog, DialogContent, Input } from './ui';
import { db } from '../lib/frappe-sdk-retry';
import { t } from '../i18n';

interface Variant {
  id: string;
  name: string;
  price: number;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  category: 'sides' | 'drinks' | 'desserts';
}

interface FrappeItemChildEntry {
  item: string;
  name?: string;
  parent?: string;
  parentfield?: string;
  parenttype?: string;
}

interface FrappeItemDoc {
  name: string;
  item_name: string;
  image?: string;
  item: string;
  custom_pos_add_on_items?: FrappeItemChildEntry[];
  custom_pos_item_variants?: FrappeItemChildEntry[];
  [key: string]: unknown;
}

interface ProductDialogProps {
  onClose: () => void;
  editMode?: boolean;
  initialVariant?: Variant;
  initialAddons?: Array<Omit<Addon, 'category'>>;
  initialQuantity?: number;
  itemToReplace?: OrderItem;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  onClose,
  editMode = false,
  initialVariant,
  initialAddons = [],
  initialQuantity,
  itemToReplace
}) => {
  const selectedItem = usePOSStore((s) => s.selectedItem);
  const addToOrder = usePOSStore((s) => s.addToOrder);
  const removeFromOrder = usePOSStore((s) => s.removeFromOrder);
  const setSelectedItem = usePOSStore((s) => s.setSelectedItem);
  const getItemQuantityFromCart = usePOSStore((s) => s.getItemQuantityFromCart);
  const activeOrders = usePOSStore((s) => s.activeOrders);
  const menuItems = usePOSStore((s) => s.menuItems);
  
  // Find existing item in cart
  const existingCartItem = selectedItem ? activeOrders.find(
    order => order.id === selectedItem.id &&
    (!order.selectedVariant || order.selectedVariant.id === initialVariant?.id) &&
    (!order.selectedAddons || order.selectedAddons.length === initialAddons.length && 
      order.selectedAddons.every(addon => 
        initialAddons.some(initAddon => initAddon.id === addon.id)
      ))
  ) : null;

  // State for the full item doc (used for all dialog content)
  const [itemDoc, setItemDoc] = useState<FrappeItemDoc | null>(null);
  const [isItemLoading, setIsItemLoading] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);

  // Fetch Item doc once when dialog opens or selectedItem changes
  // (previously two separate useEffects fetching the same doc)
  const [isAddonLoading, setIsAddonLoading] = useState(false);
  const [addonError, setAddonError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!selectedItem) {
      setItemDoc(null);
      setItemError(null);
      setIsItemLoading(false);
      setAddonError(null);
      setIsAddonLoading(false);
      return;
    }
    let cancelled = false;
    setIsItemLoading(true);
    setIsAddonLoading(true);
    setItemError(null);
    setAddonError(null);
    db.getDoc<FrappeItemDoc>('Item', selectedItem.item)
      .then((doc) => {
        if (cancelled) return;
        setItemDoc(doc);
      })
      .catch(() => {
        if (cancelled) return;
        setItemError(t('errors.failed_fetch_item_details'));
        setItemDoc(null);
        setAddonError(t('errors.failed_fetch_addons'));
      })
      .finally(() => {
        if (!cancelled) {
          setIsItemLoading(false);
          setIsAddonLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [selectedItem]);

  const addonDetails = Array.isArray(itemDoc?.custom_pos_add_on_items)
    ? itemDoc.custom_pos_add_on_items
        .map((entry: FrappeItemChildEntry) => {
          const menuAddon = menuItems.find((menuItem) => menuItem.item === entry.item);
          return menuAddon
            ? {
                id: menuAddon.item,
                name: menuAddon.item_name,
                price: Number(menuAddon.price)
              }
            : {
                id: entry.item,
                name: entry.item,
                price: 0
              };
        })
        .filter(Boolean)
    : [];

  const variantDetails = Array.isArray(itemDoc?.custom_pos_item_variants)
    ? itemDoc.custom_pos_item_variants
        .map((entry: FrappeItemChildEntry) => {
          const menuVariant = menuItems.find((menuItem) => menuItem.item === entry.item);
          return menuVariant
            ? {
                id: menuVariant.item,
                name: menuVariant.item_name,
                price: Number(menuVariant.price)
              }
            : {
                id: entry.item,
                name: entry.item,
                price: 0
              };
        })
        .filter(Boolean)
    : [];

  const [selectedAddons, setSelectedAddons] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [quantity, setQuantity] = useState<string>(editMode ? initialQuantity?.toString() || '0' : '0');
  const [comments, setComments] = useState<string>(itemToReplace?.comment || existingCartItem?.comment || '');
  const dialogRef = useRef<HTMLDivElement>(null);

  // Initialize quantity and comments from cart if not in edit mode
  useEffect(() => {
    if (!editMode && selectedItem) {
      if (existingCartItem) {
        setQuantity(existingCartItem.quantity.toString());
        setComments(existingCartItem.comment || '');
      } else {
        const cartQuantity = getItemQuantityFromCart(selectedItem);
        setQuantity(cartQuantity.toString());
      }
    }
  }, [selectedItem, editMode, getItemQuantityFromCart, existingCartItem]);

  // Handle click outside to close dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setSelectedItem(null);
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // R43-FIX: Removed the separate Escape key handler. The Dialog component
  // already handles Escape via its onOpenChange prop (which calls handleClose).
  // Previously, both handlers fired on Escape — the custom one called
  // setSelectedItem(null) + onClose(), and Dialog's handler called
  // onOpenChange(handleClose). This caused double-close behavior and
  // unnecessary re-renders. Now only Dialog's built-in handling is used.

  if (!selectedItem) return null;

  // Always get price from menuItems for the main item
  const basePrice = selectedItem?.price ? Number(selectedItem.price) : 0;
  const numericQuantity = quantity === '' ? 0 : parseInt(quantity, 10);
  // R39-FIX: Use roundMoney on addon accumulation to prevent floating-point drift
  // (e.g. 0.1 + 0.2 = 0.30000000000000004)
  const addonsTotal = roundMoney(selectedAddons.reduce((sum, addon) => sum + addon.price, 0));
  // R39-FIX: Match the cart's calculation exactly — round the unit price first,
  // then multiply by quantity, then round the line total. This ensures the price
  // shown in the dialog matches what appears in OrderPanel after adding to cart.
  // Previously: roundMoney((basePrice + addonsTotal) * numericQuantity) which could
  // differ from the cart's roundMoney(roundMoney(basePrice + addonsTotal) * quantity)
  // by up to 0.01 per line due to rounding at different stages.
  const unitPrice = roundMoney(basePrice + addonsTotal);
  const total = roundMoney(unitPrice * numericQuantity);

  const handleQuantityChange = (value: string) => {
    // Allow empty string or numbers
    if (value === '') {
      setQuantity('');
      return;
    }

    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num <= 99) {
      setQuantity(num.toString());
    }
  };

  const handleIncrement = () => {
    const currentNum = quantity === '' ? 0 : parseInt(quantity, 10);
    if (currentNum < 99) {
      setQuantity((currentNum + 1).toString());
    }
  };

  const handleDecrement = () => {
    const currentNum = quantity === '' ? 0 : parseInt(quantity, 10);
    if (currentNum > 0) {
      setQuantity((currentNum - 1).toString());
    }
  };

  const handleAddToOrder = async () => {
    // R41-FIX: Wrap async body in try/catch so that unhandled promise
    // rejections from addToOrder or removeFromOrder don't crash the dialog.
    // Previously the function was async but had no outer try/catch, so any
    // unexpected error (e.g. network failure during cart update) would
    // propagate as an unhandled promise rejection.
    const numericQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
    if (isNaN(numericQuantity) || numericQuantity === 0) {
      return; // Don't add to order if quantity is 0 or invalid
    }

    if (editMode && itemToReplace?.uniqueId) {
      // R39-FIX: Await removeFromOrder before adding the replacement.
      // Previously this was not awaited, which meant addToOrder could execute
      // before the old item was removed from activeOrders. While Zustand's set()
      // is synchronous, the async wrapper's catch block could set an error state
      // after addToOrder already ran, causing inconsistent state. Awaiting ensures
      // the removal completes (or fails) before we proceed.
      try {
        await removeFromOrder(itemToReplace.uniqueId);
      } catch {
        // If removal fails, still allow adding the new item
      }
    }

    // R39-FIX: Include selectedAddons on the main item so that:
    // 1. generateUniqueId produces distinct IDs for same-item-different-addons
    // 2. OrderPanel displays add-ons under the parent item
    // 3. Editing preserves add-on selection
    // 4. Order submission includes add-on data
    // Previously add-ons were added as separate cart lines, which caused uniqueId
    // collisions (same item + variant but different add-ons got merged) and lost
    // the parent-child relationship.
    const orderItem: OrderItem = {
      ...selectedItem,
      quantity: numericQuantity,
      price: basePrice,
      selectedAddons: selectedAddons.length > 0 ? selectedAddons : undefined,
      comment: comments || undefined
    };
    // R40-FIX: Await addToOrder so that errors (e.g. quantity exceeds max)
    // are handled before closing the dialog. Previously addToOrder was not
    // awaited, so the dialog closed immediately even if the add operation
    // failed, losing the user's quantity/addon selections.
    try {
      await addToOrder(orderItem);
    } catch {
      // addToOrder sets its own error state in the store;
      // don't close the dialog so the user can retry or adjust.
      return;
    }

    handleClose();
  };

  const handleClose = () => {
    setSelectedItem(null);
    onClose();
  };

  const handleAddonToggle = (addon: Omit<Addon, 'category'>) => {
    setSelectedAddons(current => 
      current.some(item => item.id === addon.id)
        ? current.filter(item => item.id !== addon.id)
        : [...current, addon]
    );
  };

  // Handler to switch to a variant item
  const handleVariantClick = (variantId: string) => {
    const menuVariant = menuItems.find((m) => m.item === variantId);
    if (menuVariant) {
      setSelectedItem(menuVariant);
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent 
        ref={dialogRef}
        variant="xlarge"
        className="bg-white w-full max-w-[90rem] max-h-[90vh] overflow-y-auto flex flex-col md:flex-row p-0"
        showCloseButton={false}
      >
        {/* Left Column - Image  */}
        <div className="md:w-1/3 relative">
          {itemDoc?.image && !imgError ? (
            <img
              src={itemDoc.image}
              alt={itemDoc.name}
              className="w-full min-h-96 h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full min-h-96 h-full bg-gray-200 flex items-center justify-center text-[8rem] text-gray-400 font-medium rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
              {itemDoc?.name?.slice(0, 2)?.toUpperCase() || ''}
            </div>
          )}
          <Button
            onClick={handleClose}
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 bg-white shadow-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Middle Column - Variants and Quantity */}
        <div className="md:w-1/3 p-6 overflow-y-auto">
          {isItemLoading && (
            <div className="flex items-center justify-center py-4 text-gray-500">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin me-2" />
              {t('common.loading')}
            </div>
          )}
          {itemError && (
            <div className="text-red-500 text-sm py-2">{itemError}</div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedItem?.item_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">{selectedItem?.item}</span>
              {(selectedItem?.course_label || selectedItem?.course) && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm font-medium text-blue-600">{selectedItem?.course_label || selectedItem?.course}</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">{t('product_dialog.special_instructions')}</h3>
            <Input
              placeholder={t('product_dialog.special_instructions_placeholder')}
              value={comments}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setComments(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">{t('product_dialog.quantity')}</h3>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDecrement}
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="0"
                max="99"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                onBlur={() => {
                  // If empty on blur, set to 0
                  if (quantity === '') {
                    setQuantity('0');
                  }
                }}
                className="w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                onClick={handleIncrement}
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Variants Section  */}
          {variantDetails.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">{t('product_dialog.variants')}</h3>
              <div className="flex gap-2 flex-wrap">
                {variantDetails.map((variant) => {
                  const menuVariant = menuItems.find((m) => m.item === variant.id);
                  return (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantClick(variant.id)}
                      className={cn(
                        'p-2 rounded-lg border text-left w-full flex justify-between items-center',
                        variant.id === itemDoc?.item
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      )}
                    >
                      <div className="font-medium">{variant.name}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(menuVariant ? Number(menuVariant.price) : 0)}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>


        {/* Right Column - Add-ons and Order Button */}
        <div className="h-auto md:w-1/3 p-6 border-t md:border-t-0 md:border-l border-gray-200 overflow-y-auto flex flex-col">
          <div className="overflow-y-auto mb-6">
            {isAddonLoading ? (
              <div className="mb-6 flex items-center justify-center text-gray-500">{t('product_dialog.loading_addons')}</div>
            ) : addonError ? (
              <div className="flex items-center justify-center text-red-500">{addonError}</div>
            ) : addonDetails.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{t('product_dialog.addons')}</h3>
                <div className="space-y-2">
                  {addonDetails.map((addon) => (
                    <button
                      key={addon.id}
                      onClick={() => handleAddonToggle({ id: addon.id, name: addon.name, price: Number(addon.price) })}
                      className={cn(
                        'w-full p-3 rounded-lg border text-left',
                        selectedAddons.some(item => item.id === addon.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span>{addon.name}</span>
                        <span className="text-sm text-gray-500">+{formatCurrency(Number(addon.price))}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center text-gray-400 text-sm">{t('product_dialog.no_addons')}</div>
            )}
          </div>
          {/* Always show total section at the end */}
          <div className="mt-auto pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{t('product_dialog.total')}&nbsp;</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button
              onClick={handleAddToOrder}
              className="w-full mt-4"
              size="lg"
              disabled={numericQuantity === 0}
            >
              {editMode || existingCartItem ? t('product_dialog.update_order') : t('product_dialog.add_to_order')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog; 