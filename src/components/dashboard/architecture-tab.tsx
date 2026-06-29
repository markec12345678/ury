'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  frontendApps,
  backendComponents,
  infrastructureComponents,
  doctypes,
  docEventHooks,
} from '@/lib/mock-data';

const frontendIcons: Record<string, string> = {
  'POS React': '⚛️',
  'KOT Mosaic Vue': '🟢',
  'POS v1 Vue': '🟡',
};

export function ArchitectureTab() {
  return (
    <div className="space-y-6">
      {/* Architecture Diagram */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Arhitektura sistema URY</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-6 md:p-8 overflow-x-auto">
            {/* Row Labels */}
            <div className="flex flex-col gap-6 min-w-[700px]">
              {/* Frontend Layer */}
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Frontend
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {frontendApps.map((app) => (
                    <div
                      key={app.name}
                      className="relative bg-white border-2 border-emerald-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{frontendIcons[app.name]}</span>
                        <span className="font-bold text-sm">{app.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] mb-1">
                        {app.tech}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{app.description}</p>
                      <code className="text-[10px] text-emerald-600 block mt-1">{app.path}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connection Arrows: Frontend → Backend */}
              <div className="flex justify-center">
                <div className="flex flex-col items-center gap-0">
                  <div className="w-0.5 h-6 bg-emerald-400" />
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-emerald-400" />
                  <span className="text-[10px] text-muted-foreground mt-1">REST API + WebSocket</span>
                </div>
              </div>

              {/* Backend Layer */}
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Backend
                </div>
                <div className="flex justify-center">
                  <div className="bg-white border-2 border-amber-400 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow max-w-lg w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🏗️</span>
                      <span className="font-bold">{backendComponents[0].name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{backendComponents[0].description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['REST API', 'ORM', 'Auth', 'Doctypes', 'Schedular', 'Realtime', 'Print'].map((f) => (
                        <Badge key={f} variant="secondary" className="text-[10px]">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Arrows: Backend → Infrastructure */}
              <div className="flex justify-center">
                <div className="flex items-center gap-8">
                  {['MariaDB', 'Socket.io', 'QZ Tray'].map((name, i) => (
                    <div key={name} className="flex flex-col items-center">
                      <div className="w-0.5 h-6 bg-amber-400" />
                      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-amber-400" />
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {['SQL', 'WS', 'HTTP'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Infrastructure Layer */}
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Infrastruktura
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {infrastructureComponents.map((comp, i) => (
                    <div
                      key={comp.name}
                      className="bg-white border-2 border-violet-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{['🗄️', '🔌', '🖨️'][i]}</span>
                        <span className="font-bold text-sm">{comp.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{comp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctypes & Hooks Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctypes List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              DocTypes
              <Badge variant="secondary" className="text-xs">{doctypes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-1.5 pr-3">
                {doctypes.map((dt) => (
                  <div
                    key={dt}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <code className="text-sm font-mono">{dt}</code>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Document Event Hooks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Document Event Hooks
              <Badge variant="secondary" className="text-xs">{docEventHooks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-3">
                {docEventHooks.map((hook) => (
                  <div key={hook.doctype} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <code className="text-sm font-mono font-semibold">{hook.doctype}</code>
                    </div>
                    <div className="ml-4 flex flex-wrap gap-1">
                      {hook.events.map((event) => (
                        <Badge
                          key={event}
                          variant="outline"
                          className="text-[10px] font-mono"
                        >
                          {event}
                        </Badge>
                      ))}
                    </div>
                    <Separator className="mt-1" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
