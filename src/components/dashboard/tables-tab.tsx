'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, ShoppingCart, IndianRupee } from 'lucide-react';
import { tablesData, rooms, type TableData, type TableStatus, CURRENCY } from '@/lib/mock-data';

const statusColors: Record<TableStatus, string> = {
  free: 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100',
  occupied: 'border-amber-400 bg-amber-50 hover:bg-amber-100',
  attention: 'border-red-400 bg-red-50 hover:bg-red-100',
  active: 'border-sky-400 bg-sky-50 hover:bg-sky-100',
};

const statusDot: Record<TableStatus, string> = {
  free: 'bg-emerald-500',
  occupied: 'bg-amber-500',
  attention: 'bg-red-500',
  active: 'bg-sky-500',
};

const statusLabel: Record<TableStatus, string> = {
  free: 'Prosto',
  occupied: 'Zasedeno',
  attention: 'Pozor!',
  active: 'Aktivno',
};

export function TablesTab() {
  const [activeRoom, setActiveRoom] = useState('glavna');
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);

  const filteredTables = tablesData.filter((t) => t.room === activeRoom);

  return (
    <div className="space-y-4">
      {/* Room Tabs */}
      <div className="flex flex-wrap gap-2">
        {rooms.map((room) => {
          const roomTables = tablesData.filter((t) => t.room === room.id);
          const occupied = roomTables.filter((t) => t.status !== 'free').length;
          return (
            <Button
              key={room.id}
              variant={activeRoom === room.id ? 'default' : 'outline'}
              className={activeRoom === room.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => setActiveRoom(room.id)}
            >
              {room.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {occupied}/{room.tables}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Prosto</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Zasedeno</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Pozor (&gt;30min)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-500 inline-block" /> Aktivno</span>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredTables.map((table) => (
          <Card
            key={table.id}
            className={`cursor-pointer transition-all duration-200 border-2 ${statusColors[table.status]} shadow-sm hover:shadow-md`}
            onClick={() => setSelectedTable(table)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold">Miza {table.id}</span>
                <span className={`w-3 h-3 rounded-full ${statusDot[table.status]} ${table.status === 'attention' ? 'animate-pulse' : ''}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{table.status === 'free' ? '—' : `${table.pax} oseb`}</span>
                </div>
                {table.occupiedSince && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{table.occupiedSince} min</span>
                  </div>
                )}
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    table.status === 'attention'
                      ? 'border-red-300 text-red-700'
                      : table.status === 'free'
                      ? 'border-emerald-300 text-emerald-700'
                      : 'border-amber-300 text-amber-700'
                  }`}
                >
                  {statusLabel[table.status]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Detail Dialog */}
      <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Miza {selectedTable?.id}
              {selectedTable && (
                <Badge
                  className={
                    selectedTable.status === 'attention'
                      ? 'bg-red-100 text-red-700'
                      : selectedTable.status === 'free'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }
                >
                  {selectedTable ? statusLabel[selectedTable.status] : ''}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedTable && selectedTable.status !== 'free' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedTable.pax} oseb</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedTable.occupiedSince} min</span>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Stranka</p>
                <p className="font-medium">{selectedTable.customer}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Naročeni artikli</p>
                </div>
                <ul className="space-y-1">
                  {selectedTable.orderItems?.map((item, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Skupaj</span>
                <span className="text-lg font-bold flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {selectedTable.orderTotal?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
          {selectedTable && selectedTable.status === 'free' && (
            <div className="py-8 text-center text-muted-foreground">
              <UtensilsIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Miza je prosta</p>
              <p className="text-sm">Pripravljena za nove goste</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UtensilsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
