'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, ChefHat, Flame, UtensilsCrossed, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { kotCards, type KOTCard, type KOTStatus, type ProductionUnit } from '@/lib/mock-data';

const statusConfig: Record<KOTStatus, { border: string; bg: string; icon: React.ElementType; label: string; badgeClass: string }> = {
  new: { border: 'border-gray-300', bg: 'bg-white', icon: Flame, label: 'Novo', badgeClass: 'bg-gray-100 text-gray-700 border-gray-300' },
  modified: { border: 'border-orange-400', bg: 'bg-orange-50', icon: AlertTriangle, label: 'Spremenjeno', badgeClass: 'bg-orange-100 text-orange-700 border-orange-300' },
  cancelled: { border: 'border-red-400', bg: 'bg-red-50', icon: XCircle, label: 'Preklicano', badgeClass: 'bg-red-100 text-red-700 border-red-300' },
  ready: { border: 'border-emerald-400', bg: 'bg-emerald-50', icon: CheckCircle2, label: 'Pripravljeno', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  preparing: { border: 'border-amber-400', bg: 'bg-amber-50', icon: ChefHat, label: 'V pripravi', badgeClass: 'bg-amber-100 text-amber-700 border-amber-300' },
  served: { border: 'border-emerald-300', bg: 'bg-emerald-50/50', icon: UtensilsCrossed, label: 'Postreženo', badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
};

const productionUnits: ProductionUnit[] = ['Kuhinja 1', 'Kuhinja 2', 'Bar'];

export function KitchenTab() {
  const [activeUnit, setActiveUnit] = useState<ProductionUnit | 'all'>('all');
  const [cards, setCards] = useState<KOTCard[]>(kotCards);

  const filteredCards = cards.filter(
    (c) => activeUnit === 'all' || c.production === activeUnit
  );

  const updateStatus = (id: string, newStatus: KOTStatus) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const getElapsedColor = (minutes: number) => {
    if (minutes > 30) return 'text-red-600';
    if (minutes > 15) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="space-y-4">
      {/* Production Unit Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-muted-foreground mr-2">Proizvodna enota:</span>
        <Button
          variant={activeUnit === 'all' ? 'default' : 'outline'}
          size="sm"
          className={activeUnit === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          onClick={() => setActiveUnit('all')}
        >
          Vse
        </Button>
        {productionUnits.map((unit) => {
          const count = cards.filter(
            (c) => c.production === unit && c.status !== 'served'
          ).length;
          return (
            <Button
              key={unit}
              variant={activeUnit === unit ? 'default' : 'outline'}
              size="sm"
              className={activeUnit === unit ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => setActiveUnit(unit)}
            >
              {unit}
              {count > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* KOT Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCards.map((card) => {
          const config = statusConfig[card.status];
          const Icon = config.icon;
          return (
            <Card
              key={card.id}
              className={`border-2 ${config.border} ${config.bg} transition-all shadow-sm hover:shadow-md`}
            >
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{card.orderNo}</span>
                    <Badge variant="outline" className={config.badgeClass}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className={`h-4 w-4 ${getElapsedColor(card.elapsed)}`} />
                    <span className={`text-sm font-mono font-bold ${getElapsedColor(card.elapsed)}`}>
                      {card.elapsed} min
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-medium">{card.id}</span>
                  <span>Miza: <strong>{card.table}</strong></span>
                </div>

                {/* Type badge */}
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    card.kotType === 'New Order'
                      ? 'border-emerald-300 text-emerald-700'
                      : card.kotType === 'Order Modified'
                      ? 'border-orange-300 text-orange-700'
                      : 'border-red-300 text-red-700'
                  }`}
                >
                  {card.kotType}
                </Badge>

                <Separator />

                {/* Items */}
                <div className="space-y-1.5">
                  {card.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {item.qty}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      {item.course && (
                        <span className="text-xs text-muted-foreground">{item.course}</span>
                      )}
                    </div>
                  ))}
                  {card.items.some((item) => item.comments) && (
                    <div className="mt-1 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                      💬 {card.items.filter((i) => i.comments).map((i) => i.comments).join(', ')}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Production Unit & Actions */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {card.production}
                  </Badge>
                  <div className="flex gap-1.5">
                    {(card.status === 'new' || card.status === 'modified') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-amber-400 text-amber-700 hover:bg-amber-100"
                        onClick={() => updateStatus(card.id, 'preparing')}
                      >
                        V pripravi
                      </Button>
                    )}
                    {card.status === 'preparing' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-emerald-400 text-emerald-700 hover:bg-emerald-100"
                        onClick={() => updateStatus(card.id, 'ready')}
                      >
                        Pripravljeno
                      </Button>
                    )}
                    {card.status === 'ready' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-emerald-500 text-emerald-700 hover:bg-emerald-100"
                        onClick={() => updateStatus(card.id, 'served')}
                      >
                        Postreženo
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Ni aktivnih naročil za izbrano proizvodno enoto</p>
        </div>
      )}
    </div>
  );
}
