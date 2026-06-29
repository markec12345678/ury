'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
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

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function ArchitectureTab() {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Architecture Diagram */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            🏗️ Arhitektura sistema URY
            <Badge variant="outline" className="text-xs font-normal">3-tier</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-b from-emerald-50/50 via-amber-50/30 to-violet-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-xl p-6 md:p-8 overflow-x-auto">
            <div className="flex flex-col gap-4 min-w-[700px]">
              {/* Frontend Layer */}
              <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 rounded text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Frontend
                  </div>
                  <div className="flex-1 h-px bg-emerald-200 dark:bg-emerald-800" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {frontendApps.map((app, i) => (
                    <motion.div
                      key={app.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className={`relative bg-white dark:bg-gray-900 border-2 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer ${
                        hoveredComponent === app.name ? 'border-emerald-500 scale-105' : 'border-emerald-300 dark:border-emerald-700'
                      }`}
                      onMouseEnter={() => setHoveredComponent(app.name)}
                      onMouseLeave={() => setHoveredComponent(null)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{frontendIcons[app.name]}</span>
                        <span className="font-bold text-sm dark:text-white">{app.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] mb-1">
                        {app.tech}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{app.description}</p>
                      <code className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1">{app.path}</code>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Connection Arrows: Frontend → Backend */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
              >
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-emerald-400" />
                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-amber-400" />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                    <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">REST API</span>
                    <span className="text-[10px] text-amber-400">+</span>
                    <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">WebSocket</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-emerald-400" />
                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-amber-400" />
                  </div>
                </div>
              </motion.div>

              {/* Backend Layer */}
              <motion.div {...fadeIn} transition={{ delay: 0.6 }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    Backend
                  </div>
                  <div className="flex-1 h-px bg-amber-200 dark:bg-amber-800" />
                </div>
                <div className="flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className={`bg-white dark:bg-gray-900 border-2 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all max-w-2xl w-full ${
                      hoveredComponent === 'backend' ? 'border-amber-500 scale-[1.01]' : 'border-amber-400 dark:border-amber-600'
                    }`}
                    onMouseEnter={() => setHoveredComponent('backend')}
                    onMouseLeave={() => setHoveredComponent(null)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🏗️</span>
                      <span className="font-bold dark:text-white">{backendComponents[0].name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{backendComponents[0].description}</p>
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {[
                        { icon: '🔌', label: 'REST API', sub: '36 endpointov' },
                        { icon: '🗄️', label: 'ORM', sub: 'MariaDB' },
                        { icon: '🔐', label: 'Auth', sub: 'Role-based' },
                        { icon: '📋', label: 'Doctypes', sub: '35 custom' },
                        { icon: '⏰', label: 'Scheduler', sub: 'Cron jobs' },
                        { icon: '📡', label: 'Realtime', sub: 'Socket.io' },
                        { icon: '🖨️', label: 'Print', sub: 'QZ + Network' },
                        { icon: '🔔', label: 'Notifications', sub: 'Delay alerts' },
                      ].map((f) => (
                        <div key={f.label} className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-2 text-center hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors">
                          <span className="text-lg block">{f.icon}</span>
                          <span className="text-[10px] font-medium block dark:text-amber-200">{f.label}</span>
                          <span className="text-[9px] text-muted-foreground block">{f.sub}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Connection Arrows: Backend → Infrastructure */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex justify-center"
              >
                <div className="flex items-center gap-4">
                  {[
                    { label: 'SQL', color: 'violet' },
                    { label: 'WS', color: 'violet' },
                    { label: 'HTTP', color: 'violet' },
                  ].map((conn, i) => (
                    <div key={conn.label} className="flex flex-col items-center">
                      <div className="w-0.5 h-4 bg-violet-400" />
                      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-violet-400" />
                      <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">{conn.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Infrastructure Layer */}
              <motion.div {...fadeIn} transition={{ delay: 1.0 }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 rounded text-[10px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                    Infrastruktura
                  </div>
                  <div className="flex-1 h-px bg-violet-200 dark:bg-violet-800" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {infrastructureComponents.map((comp, i) => (
                    <motion.div
                      key={comp.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 + i * 0.1 }}
                      className={`bg-white dark:bg-gray-900 border-2 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all ${
                        hoveredComponent === comp.name ? 'border-violet-500 scale-105' : 'border-violet-300 dark:border-violet-700'
                      }`}
                      onMouseEnter={() => setHoveredComponent(comp.name)}
                      onMouseLeave={() => setHoveredComponent(null)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{['🗄️', '🔌', '🖨️'][i]}</span>
                        <span className="font-bold text-sm dark:text-white">{comp.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{comp.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Data Flow Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="flex justify-center pt-2"
              >
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-50 via-amber-50 to-violet-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-lg border">
                  <span className="text-[10px] text-muted-foreground">Podatkovni tok:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">👤 Stranka</span>
                    <span className="text-emerald-500">→</span>
                    <span className="text-xs">📱 POS</span>
                    <span className="text-emerald-500">→</span>
                    <span className="text-xs">🍳 KOT</span>
                    <span className="text-amber-500">→</span>
                    <span className="text-xs">💰 Račun</span>
                    <span className="text-violet-500">→</span>
                    <span className="text-xs">📊 P&L</span>
                  </div>
                </div>
              </motion.div>
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
              📋 Custom DocTypes
              <Badge variant="secondary" className="text-xs">{doctypes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-1 pr-3">
                {doctypes.map((dt, i) => (
                  <motion.div
                    key={dt}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors group"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 group-hover:scale-125 transition-transform" />
                    <code className="text-sm font-mono dark:text-gray-300">{dt}</code>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Document Event Hooks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              🪝 Document Event Hooks
              <Badge variant="secondary" className="text-xs">{docEventHooks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-3">
                {docEventHooks.map((hook, i) => (
                  <motion.div
                    key={hook.doctype}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <code className="text-sm font-mono font-semibold dark:text-gray-200">{hook.doctype}</code>
                      <Badge variant="outline" className="text-[9px] ml-auto">
                        {hook.events.length} hook{hook.events.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="ml-4 flex flex-wrap gap-1">
                      {hook.events.map((event) => (
                        <Badge
                          key={event}
                          variant="outline"
                          className={`text-[10px] font-mono ${
                            event === 'before_insert' ? 'border-blue-300 text-blue-700 dark:text-blue-400' :
                            event === 'validate' ? 'border-amber-300 text-amber-700 dark:text-amber-400' :
                            event === 'before_submit' ? 'border-emerald-300 text-emerald-700 dark:text-emerald-400' :
                            event === 'on_cancel' ? 'border-red-300 text-red-700 dark:text-red-400' :
                            'border-gray-300 text-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {event}
                        </Badge>
                      ))}
                    </div>
                    <Separator className="mt-1" />
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '⚛️', label: 'Frontend aplikacije', value: '3', color: 'emerald' },
          { icon: '🔌', label: 'API endpointi', value: '36', color: 'amber' },
          { icon: '📋', label: 'Custom doctype-i', value: '35', color: 'violet' },
          { icon: '🪝', label: 'Document hooks', value: '7', color: 'rose' },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="p-4">
              <span className="text-2xl block mb-1">{stat.icon}</span>
              <p className="text-2xl font-bold dark:text-white">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
