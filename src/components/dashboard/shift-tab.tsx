'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Clock,
  User,
  Wallet,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Timer,
  ArrowRightLeft,
  ShoppingCart,
  Euro,
  AlertTriangle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useURYStore } from '@/lib/ury-store';

export function ShiftTab() {
  const {
    cashiers,
    shiftInfo,
    currency,
    isConnected,
    openShift,
    closeShift,
    transferShift,
  } = useURYStore();

  const [selectedCashier, setSelectedCashier] = useState<string | null>(null);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [openedBy, setOpenedBy] = useState('');

  const totalOpening = cashiers.reduce((sum, c) => sum + c.openingBalance, 0);
  const totalCurrent = cashiers.reduce((sum, c) => sum + c.currentTotal, 0);
  const totalCash = cashiers.reduce((sum, c) => sum + c.cashPayments, 0);
  const totalCard = cashiers.reduce((sum, c) => sum + c.cardPayments, 0);
  const totalUPI = cashiers.reduce((sum, c) => sum + c.upiPayments, 0);
  const totalOrders = cashiers.reduce((sum, c) => sum + c.ordersProcessed, 0);

  const now = new Date();
  const [openedH, openedM] = shiftInfo.openedAt.split(':').map(Number);
  const shiftHours = (now.getHours() - openedH) + (now.getMinutes() - openedM) / 60;
  const totalShiftHours = (() => {
    const [closeH, closeM] = shiftInfo.closesAt.split(':').map(Number);
    return (closeH - openedH) + (closeM - openedM) / 60;
  })();
  const shiftProgress = Math.min((Math.max(shiftHours, 0) / totalShiftHours) * 100, 100);

  const selectedCashierData = cashiers.find((c) => c.name === selectedCashier);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs flex items-center gap-1.5">
          {isConnected ? (
            <><Wifi className="h-3 w-3 text-emerald-500" /> Povezano s Frappe</>
          ) : (
            <><WifiOff className="h-3 w-3 text-gray-400" /> Simulacija</>
          )}
        </Badge>
        {shiftInfo.status === 'open' && (
          <Badge className="bg-emerald-600 text-white text-xs animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
            Smena aktivna
          </Badge>
        )}
      </div>

      {/* Shift Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border-2 ${shiftInfo.status === 'open' ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800' : 'border-gray-200 bg-gray-50 dark:bg-gray-900/10 dark:border-gray-700'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${shiftInfo.status === 'open' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-400'}`}>
                Trenutna smena
              </span>
              <Badge className={`${shiftInfo.status === 'open' ? 'bg-emerald-600' : 'bg-gray-500'} text-white text-xs`}>
                {shiftInfo.status === 'open' ? 'Odprta' : 'Zaprta'}
              </Badge>
            </div>
            <p className={`text-2xl font-bold ${shiftInfo.status === 'open' ? 'text-emerald-800 dark:text-emerald-300' : 'text-gray-800 dark:text-gray-300'}`}>
              {shiftInfo.openedAt} — {shiftInfo.closesAt}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Odprl: {shiftInfo.openedBy} • Saldo: {currency}{shiftInfo.openingBalance.toLocaleString('sl-SI')}
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                <span>Potek</span>
                <span>{Math.round(shiftProgress)}%</span>
              </div>
              <Progress value={shiftProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Skupni promet</span>
            </div>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              {currency}{totalCurrent.toLocaleString('sl-SI')}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Odpiralni saldo: {currency}{totalOpening.toLocaleString('sl-SI')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-200 bg-violet-50 dark:bg-violet-900/10 dark:border-violet-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-700 dark:text-violet-400">Naročila</span>
            </div>
            <p className="text-2xl font-bold text-violet-800 dark:text-violet-300">{totalOrders}</p>
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
              {cashiers.filter((c) => c.status === 'active').length} aktivnih blagajnikov
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Razdelitev plačil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <Banknote className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-xs text-green-600 font-medium">Gotovina</p>
                <p className="text-lg font-bold text-green-800 dark:text-green-300">{currency}{totalCash.toLocaleString('sl-SI')}</p>
                <p className="text-[10px] text-green-500">{totalCurrent > 0 ? Math.round((totalCash / totalCurrent) * 100) : 0}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600 font-medium">Kartica</p>
                <p className="text-lg font-bold text-blue-800 dark:text-blue-300">{currency}{totalCard.toLocaleString('sl-SI')}</p>
                <p className="text-[10px] text-blue-500">{totalCurrent > 0 ? Math.round((totalCard / totalCurrent) * 100) : 0}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <Smartphone className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-xs text-purple-600 font-medium">UPI</p>
                <p className="text-lg font-bold text-purple-800 dark:text-purple-300">{currency}{totalUPI.toLocaleString('sl-SI')}</p>
                <p className="text-[10px] text-purple-500">{totalCurrent > 0 ? Math.round((totalUPI / totalCurrent) * 100) : 0}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cashier Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Aktivni blagajniki
            <Badge variant="secondary" className="text-xs">{cashiers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cashiers.map((cashier) => (
              <div
                key={cashier.name}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  selectedCashier === cashier.name
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200'
                }`}
                onClick={() => setSelectedCashier(selectedCashier === cashier.name ? null : cashier.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <User className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold dark:text-white">{cashier.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{cashier.role}</Badge>
                        <span className="text-xs text-muted-foreground">{cashier.room}</span>
                        {cashier.status === 'closing' && (
                          <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-300">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Zapiranje
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold flex items-center gap-1 dark:text-white">
                      {currency}{cashier.currentTotal.toLocaleString('sl-SI')}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Od {cashier.openedAt}
                    </div>
                  </div>
                </div>

                {selectedCashier === cashier.name && (
                  <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
                        <Banknote className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-green-600">Gotovina</p>
                        <p className="font-bold text-green-800 dark:text-green-300">{currency}{cashier.cashPayments.toLocaleString('sl-SI')}</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                        <CreditCard className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-blue-600">Kartica</p>
                        <p className="font-bold text-blue-800 dark:text-blue-300">{currency}{cashier.cardPayments.toLocaleString('sl-SI')}</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                        <Smartphone className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                        <p className="text-xs text-purple-600">UPI</p>
                        <p className="font-bold text-purple-800 dark:text-purple-300">{currency}{cashier.upiPayments.toLocaleString('sl-SI')}</p>
                      </div>
                      <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                        <ShoppingCart className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                        <p className="text-xs text-amber-600">Naročila</p>
                        <p className="font-bold text-amber-800 dark:text-amber-300">{cashier.ordersProcessed}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Odpiralni saldo</span>
                      <span className="font-medium dark:text-white">{currency}{cashier.openingBalance.toLocaleString('sl-SI')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pričakovan zaključni saldo</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {currency}{(cashier.openingBalance + cashier.currentTotal).toLocaleString('sl-SI')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shift Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          className="h-16 bg-emerald-600 hover:bg-emerald-700 text-base"
          disabled={shiftInfo.status === 'open'}
          onClick={() => setShowOpenDialog(true)}
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Odpri smeno
          {shiftInfo.status === 'open' && (
            <Badge className="ml-2 bg-emerald-500 text-xs">Aktivna</Badge>
          )}
        </Button>
        <Button
          variant="outline"
          className="h-16 text-base border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/10"
          disabled={shiftInfo.status === 'closed'}
          onClick={() => setShowCloseDialog(true)}
        >
          <Timer className="h-5 w-5 mr-2" />
          Zapri smeno
        </Button>
        <Button
          variant="outline"
          className="h-16 text-base border-violet-400 text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/10"
          disabled={shiftInfo.status === 'closed'}
          onClick={() => {
            if (selectedCashierData) {
              transferShift(selectedCashierData.name, '');
            }
          }}
        >
          <ArrowRightLeft className="h-5 w-5 mr-2" />
          Prenos smene
        </Button>
      </div>

      {/* Open Shift Dialog */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Odpiranje smene</DialogTitle>
            <DialogDescription>
              Vnesite podatke za odpiranje nove smene.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Odpiralni saldo ({currency})</label>
              <Input
                type="number"
                placeholder="npr. 18000"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Odprl</label>
              <Input
                placeholder="Ime operaterja"
                value={openedBy}
                onChange={(e) => setOpenedBy(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpenDialog(false)}>Prekliči</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!openingBalance || !openedBy}
              onClick={() => {
                openShift(Number(openingBalance), openedBy);
                setShowOpenDialog(false);
                setOpeningBalance('');
                setOpenedBy('');
              }}
            >
              Odpri smeno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Shift Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Zapiranje smene</DialogTitle>
            <DialogDescription>
              Ali ste prepričani, da želite zapreti trenutno smeno? Dejanje ni mogoče razveljaviti.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Povzetek smene:</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Skupni promet:</span>
                <span className="font-bold">{currency}{totalCurrent.toLocaleString('sl-SI')}</span>
              </div>
              <div className="flex justify-between">
                <span>Gotovina:</span>
                <span>{currency}{totalCash.toLocaleString('sl-SI')}</span>
              </div>
              <div className="flex justify-between">
                <span>Kartica:</span>
                <span>{currency}{totalCard.toLocaleString('sl-SI')}</span>
              </div>
              <div className="flex justify-between">
                <span>UPI:</span>
                <span>{currency}{totalUPI.toLocaleString('sl-SI')}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-bold">
                <span>Skupaj naročil:</span>
                <span>{totalOrders}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>Prekliči</Button>
            <Button
              variant="destructive"
              onClick={() => {
                closeShift();
                setShowCloseDialog(false);
              }}
            >
              Zapri smeno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
