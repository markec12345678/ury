'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  User,
  IndianRupee,
  Wallet,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Timer,
  ArrowRightLeft,
} from 'lucide-react';

interface Cashier {
  name: string;
  role: string;
  openedAt: string;
  status: 'active' | 'closing';
  openingBalance: number;
  currentTotal: number;
  cashPayments: number;
  cardPayments: number;
  upiPayments: number;
  ordersProcessed: number;
  room: string;
}

const mockCashiers: Cashier[] = [
  {
    name: "Amit Patel",
    role: "URY Cashier",
    openedAt: "09:00",
    status: "active",
    openingBalance: 5000,
    currentTotal: 48250,
    cashPayments: 22400,
    cardPayments: 15850,
    upiPayments: 10000,
    ordersProcessed: 87,
    room: "Glavna dvorana",
  },
  {
    name: "Sneha Verma",
    role: "URY Cashier",
    openedAt: "09:00",
    status: "active",
    openingBalance: 3000,
    currentTotal: 31580,
    cashPayments: 14200,
    cardPayments: 11380,
    upiPayments: 6000,
    ordersProcessed: 62,
    room: "Terasa",
  },
  {
    name: "Ravi Kumar",
    role: "URY Manager",
    openedAt: "08:30",
    status: "active",
    openingBalance: 10000,
    currentTotal: 67800,
    cashPayments: 31200,
    cardPayments: 24600,
    upiPayments: 12000,
    ordersProcessed: 124,
    room: "VIP + Bar",
  },
];

export function ShiftTab() {
  const [cashiers] = useState<Cashier[]>(mockCashiers);
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);

  const totalOpening = cashiers.reduce((sum, c) => sum + c.openingBalance, 0);
  const totalCurrent = cashiers.reduce((sum, c) => sum + c.currentTotal, 0);
  const totalCash = cashiers.reduce((sum, c) => sum + c.cashPayments, 0);
  const totalCard = cashiers.reduce((sum, c) => sum + c.cardPayments, 0);
  const totalUPI = cashiers.reduce((sum, c) => sum + c.upiPayments, 0);
  const totalOrders = cashiers.reduce((sum, c) => sum + c.ordersProcessed, 0);

  const now = new Date();
  const shiftHours = (now.getHours() - 9) + now.getMinutes() / 60;
  const shiftProgress = Math.min((shiftHours / 14) * 100, 100); // 9:00-23:00

  return (
    <div className="space-y-6">
      {/* Shift Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Trenutna smena</span>
              <Badge className="bg-emerald-600 text-white text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white mr-1 animate-pulse" />
                Odprta
              </Badge>
            </div>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
              09:00 — 23:00
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
              <IndianRupee className="h-5 w-5" />
              {totalCurrent.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Odpiralni saldo: ₹{totalOpening.toLocaleString('en-IN')}
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
              {cashiers.length} aktivnih blagajnikov
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
                <p className="text-lg font-bold text-green-800 dark:text-green-300">₹{totalCash.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-green-500">{Math.round((totalCash / totalCurrent) * 100)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600 font-medium">Kartica</p>
                <p className="text-lg font-bold text-blue-800 dark:text-blue-300">₹{totalCard.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-blue-500">{Math.round((totalCard / totalCurrent) * 100)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <Smartphone className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-xs text-purple-600 font-medium">UPI</p>
                <p className="text-lg font-bold text-purple-800 dark:text-purple-300">₹{totalUPI.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-purple-500">{Math.round((totalUPI / totalCurrent) * 100)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cashier Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            👤 Aktivni blagajniki
            <Badge variant="secondary" className="text-xs">{cashiers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cashiers.map((cashier) => (
              <div
                key={cashier.name}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  selectedCashier?.name === cashier.name
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200'
                }`}
                onClick={() => setSelectedCashier(selectedCashier?.name === cashier.name ? null : cashier)}
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
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold flex items-center gap-1 dark:text-white">
                      <IndianRupee className="h-4 w-4" />
                      {cashier.currentTotal.toLocaleString('en-IN')}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Od {cashier.openedAt}
                    </div>
                  </div>
                </div>

                {selectedCashier?.name === cashier.name && (
                  <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
                        <Banknote className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-green-600">Gotovina</p>
                        <p className="font-bold text-green-800 dark:text-green-300">₹{cashier.cashPayments.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                        <CreditCard className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-blue-600">Kartica</p>
                        <p className="font-bold text-blue-800 dark:text-blue-300">₹{cashier.cardPayments.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                        <Smartphone className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                        <p className="text-xs text-purple-600">UPI</p>
                        <p className="font-bold text-purple-800 dark:text-purple-300">₹{cashier.upiPayments.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                        <ShoppingCart className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                        <p className="text-xs text-amber-600">Naročila</p>
                        <p className="font-bold text-amber-800 dark:text-amber-300">{cashier.ordersProcessed}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Odpiralni saldo</span>
                      <span className="font-medium dark:text-white">₹{cashier.openingBalance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pričakovan zaključni saldo</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{(cashier.openingBalance + cashier.currentTotal).toLocaleString('en-IN')}
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
          disabled
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Odpri smeno
          <Badge className="ml-2 bg-emerald-500 text-xs">Aktivna</Badge>
        </Button>
        <Button variant="outline" className="h-16 text-base border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/10">
          <Timer className="h-5 w-5 mr-2" />
          Zapri smeno
        </Button>
        <Button variant="outline" className="h-16 text-base border-violet-400 text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/10">
          <ArrowRightLeft className="h-5 w-5 mr-2" />
          Prenos smene
        </Button>
      </div>
    </div>
  );
}

function ShoppingCart({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  );
}
