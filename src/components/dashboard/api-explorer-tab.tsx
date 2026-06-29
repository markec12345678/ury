'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, ChevronDown, ChevronUp, Code, Zap } from 'lucide-react';
import { useURYStore } from '@/lib/ury-store';

const moduleGroups = [
  { id: 'all', name: 'Vsi moduli', color: 'bg-gray-100' },
  { id: 'ury_pos/api.py', name: 'POS API', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'ury/api/', name: 'KOT API', color: 'bg-amber-100 text-amber-800' },
  { id: 'ury/api/ury_print.py', name: 'Print API', color: 'bg-violet-100 text-violet-800' },
];

export function APIExplorerTab() {
  const [search, setSearch] = useState('');
  const [activeModule, setActiveModule] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const { apiEndpoints, isConnected } = useURYStore();

  const filtered = useMemo(() => {
    return apiEndpoints.filter((ep) => {
      const matchesModule =
        activeModule === 'all' || ep.module.startsWith(activeModule);
      const matchesSearch =
        !search ||
        ep.method.toLowerCase().includes(search.toLowerCase()) ||
        ep.description.toLowerCase().includes(search.toLowerCase()) ||
        ep.module.toLowerCase().includes(search.toLowerCase());
      return matchesModule && matchesSearch;
    });
  }, [search, activeModule, apiEndpoints]);

  const getModuleBadge = (module: string) => {
    if (module.includes('ury_print')) return moduleGroups[3];
    if (module.includes('ury/api')) return moduleGroups[2];
    return moduleGroups[1];
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Išči po imenu metode, opisu ali modulu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {moduleGroups.map((group) => (
            <Button
              key={group.id}
              variant={activeModule === group.id ? 'default' : 'outline'}
              size="sm"
              className={activeModule === group.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => setActiveModule(group.id)}
            >
              {group.name}
              {group.id !== 'all' && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {apiEndpoints.filter((e) =>
                    group.id === 'all' || e.module.startsWith(group.id)
                  ).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>
          Prikazanih: <strong className="text-foreground">{filtered.length}</strong> / {apiEndpoints.length} končnih točk
        </span>
        {isConnected && (
          <Badge variant="outline" className="text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
            Povezano s Frappe
          </Badge>
        )}
      </div>

      {/* Endpoints List */}
      <div className="space-y-2">
        {filtered.map((ep) => {
          const isExpanded = expanded === ep.method;
          const modGroup = getModuleBadge(ep.module);
          return (
            <Card
              key={ep.method}
              className={`transition-all ${isExpanded ? 'ring-2 ring-emerald-200' : ''}`}
            >
              <CardContent className="p-0">
                {/* Collapsed Row */}
                <button
                  className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : ep.method)}
                >
                  <Badge className="shrink-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-mono">
                    POST
                  </Badge>
                  <span className="font-mono font-medium text-sm flex-1">
                    {ep.method}
                  </span>
                  <Badge variant="outline" className={`shrink-0 text-xs ${modGroup.color} border-0`}>
                    {modGroup.name}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">{ep.description}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                          <Code className="h-3 w-3" /> Modul
                        </p>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {ep.module}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                          <Zap className="h-3 w-3" /> Parametri
                        </p>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {ep.parameters}
                        </code>
                      </div>
                    </div>

                    {/* Parameter Details */}
                    {ep.paramDetails && ep.paramDetails.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Podrobnosti parametrov
                        </p>
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          {ep.paramDetails.map((param) => (
                            <div
                              key={param.name}
                              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs"
                            >
                              <code className="font-mono font-medium text-emerald-700 min-w-[120px]">
                                {param.name}
                                {param.required && (
                                  <span className="text-red-500 ml-0.5">*</span>
                                )}
                              </code>
                              <Badge variant="outline" className="text-[10px] w-fit">
                                {param.type}
                              </Badge>
                              <span className="text-muted-foreground">
                                {param.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Example Response */}
                    {ep.exampleResponse && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Primer odziva
                        </p>
                        <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto font-mono">
                          {ep.exampleResponse}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Ni najdenih končnih točk</p>
          <p className="text-sm">Poskusite spremeniti iskalni niz ali filter</p>
        </div>
      )}
    </div>
  );
}
