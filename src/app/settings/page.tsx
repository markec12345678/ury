'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Server,
  Key,
  User,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  Wifi,
  WifiOff,
  Trash2,
  ArrowRight,
  Shield,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Zap,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useURYStore } from '@/lib/ury-store';

export default function SettingsPage() {
  const {
    frappeConfig,
    isConnected,
    isConnecting,
    connectionError,
    authenticatedUser,
    lastRefreshed,
    isRefreshing,
    setFrappeConfig,
    testConnection,
    login,
    logout,
    disconnectBackend,
    refreshData,
  } = useURYStore();

  const [baseUrl, setBaseUrl] = useState(frappeConfig?.baseUrl || '');
  const [apiKey, setApiKey] = useState(frappeConfig?.apiKey || '');
  const [apiSecret, setApiSecret] = useState(frappeConfig?.apiSecret || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'token' | 'password'>('password');
  const [useProxy, setUseProxy] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (frappeConfig) {
      setBaseUrl(frappeConfig.baseUrl);
      setApiKey(frappeConfig.apiKey || '');
      setApiSecret(frappeConfig.apiSecret || '');
    }
  }, [frappeConfig]);

  const handleSaveAndTest = async () => {
    const effectiveUrl = useProxy ? '/api/frappe' : baseUrl;
    const config = { baseUrl: useProxy ? (baseUrl || process.env.NEXT_PUBLIC_FRAPPE_URL || '') : baseUrl, apiKey: apiKey || undefined, apiSecret: apiSecret || undefined };
    setFrappeConfig(config);
    setSaveSuccess(false);

    const ok = await testConnection();
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleLogin = async () => {
    const ok = await login(username, password);
    if (ok) {
      setLoginDialogOpen(false);
      setUsername('');
      setPassword('');
    }
  };

  const handleDisconnect = () => {
    disconnectBackend();
    setBaseUrl('');
    setApiKey('');
    setApiSecret('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Server className="h-6 w-6 text-emerald-600" />
          Nastavitve
        </h1>
        <p className="text-muted-foreground mt-1">
          Poveži dashboard s Frappe/ERPNext strežnikom za prikaz realnih podatkov
        </p>
      </div>

      {/* Connection Status */}
      <Card className={`border-2 ${isConnected ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <Wifi className="h-8 w-8 text-emerald-600" />
              ) : (
                <WifiOff className="h-8 w-8 text-gray-400" />
              )}
              <div>
                <p className="font-semibold text-lg">
                  {isConnected ? 'Povezano' : 'Ni povezave'}
                </p>
                {isConnected && frappeConfig && (
                  <p className="text-sm text-muted-foreground">{frappeConfig.baseUrl}</p>
                )}
                {!isConnected && (
                  <p className="text-sm text-muted-foreground">Dashboard uporablja simulirane podatke</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => refreshData()}
                    disabled={isRefreshing}
                    title="Osveži podatke"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  <Badge className="bg-emerald-600 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </>
              )}
            </div>
          </div>
          {isConnected && authenticatedUser && (
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-emerald-600" />
                <span>Prijavljen kot: <strong>{authenticatedUser}</strong></span>
                {lastRefreshed && (
                  <span className="text-muted-foreground ml-2">
                    • Zadnja osvežitev: {lastRefreshed.toLocaleTimeString('sl-SI')}
                  </span>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                Odjavi se
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Server Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Strežnik
          </CardTitle>
          <CardDescription>
            Vnesi URL svojega Frappe/ERPNext strežnika z nameščenim URY modulom
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Frappe URL</Label>
            <div className="flex gap-2">
              <Input
                id="baseUrl"
                placeholder="https://erp.myrestaurant.com"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="flex-1"
                disabled={useProxy}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(baseUrl, '_blank')}
                disabled={!baseUrl || useProxy}
                title="Odpri v brskalniku"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Poln URL do Frappe instance (brez končnega /)
            </p>
          </div>

          {/* Proxy Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Proxy način</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Zahtevki gredo skozi /api/frappe/ — reši CORS težave
                </p>
              </div>
            </div>
            <Switch
              checked={useProxy}
              onCheckedChange={setUseProxy}
            />
          </div>

          {useProxy && (
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-sm">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-muted-foreground">
                <p>V proxy načinu se vsi API zahtevki posredujejo skozi Next.js strežnik, kar odpravi CORS težave.</p>
                <p className="mt-1">Frappe URL se prebere iz <code className="text-xs bg-muted-foreground/10 px-1 rounded">NEXT_PUBLIC_FRAPPE_URL</code> env spremenljivke ali nastavitve zgoraj.</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Authentication Mode Selector */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Način avtentikacije</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLoginMode('password')}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  loginMode === 'password'
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium text-sm">Uporabniško ime</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Prijava z uporabniškim imenom in geslom
                </p>
              </button>
              <button
                onClick={() => setLoginMode('token')}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  loginMode === 'token'
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Key className="h-4 w-4" />
                  <span className="font-medium text-sm">API Token</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Avtentikacija z API ključem in skrivnostjo
                </p>
              </button>
            </div>
          </div>

          {/* Token Auth */}
          {loginMode === 'token' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  placeholder="e.g. a1b2c3d4e5f6"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiSecret">API Secret</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiSecret"
                    type={showSecret ? 'text' : 'password'}
                    placeholder="e.g. x1y2z3a4b5c6"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Ustvari API ključ v Frappe: Setup &gt; Users &gt; [Uporabnik] &gt; API Access &gt; Generate Keys
              </p>
            </div>
          )}

          {/* Password Auth */}
          {loginMode === 'password' && !isConnected && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="username">Uporabniško ime / E-pošta</Label>
                <Input
                  id="username"
                  placeholder="administrator"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Geslo</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {connectionError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              <XCircle className="h-4 w-4 shrink-0" />
              {connectionError}
            </div>
          )}

          {/* Success */}
          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Povezava uspešna! Dashboard je povezan s Frappe strežnikom.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleSaveAndTest}
              disabled={!baseUrl || isConnecting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Povezujem...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Shrani in preveri
                </>
              )}
            </Button>

            {loginMode === 'password' && isConnected && !authenticatedUser && (
              <Button
                variant="outline"
                onClick={() => setLoginDialogOpen(true)}
                className="border-amber-400 text-amber-700"
              >
                <User className="h-4 w-4 mr-2" />
                Prijavi se
              </Button>
            )}

            {isConnected && (
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Prekini povezavo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            Real-time posodobitve
          </CardTitle>
          <CardDescription>
            Socket.io konfiguracija za real-time prenos dogodkov iz Frappe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Samodejna osvežitev</p>
              <p className="text-xs text-muted-foreground">Podatki se osvežujejo vsakih 30 sekund</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {isConnected ? 'Aktivna' : 'Nedejavna'}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Frappe Socket.io</p>
              <p className="text-xs text-muted-foreground">
                {isConnected
                  ? 'Povezano — posluša dogodke URY KOT, Mize, Računi'
                  : 'Na voljo po povezavi s Frappe'}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {isConnected ? 'Povezano' : 'Čaka'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Dashboard se samodejno naroči na Frappe realtime dogodke (doc_update, list_update) za URY KOT, URY Table, POS Invoice in druge doctype-e.
          </p>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              Varnost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                Poverilnice se shranijo samo v lokalnem brskalniku (localStorage)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                Gesla se ne pošiljajo na zunanje strežnike
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                Za produkcijsko uporabo priporočamo API Token namesto gesla
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                Proxy način zahtevke posreduje varno skozi strežnik
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4 text-amber-600" />
              Zahteve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">FRAPPE</Badge>
                Frappe Framework v13+ ali ERPNext v13+
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">URY</Badge>
                URY modul nameščen na strežniku
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">CORS</Badge>
                Omogoči proxy način ali dodaj URL v Frappe CORS
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">ENV</Badge>
                NEXT_PUBLIC_FRAPPE_URL za privzeto konfiguracijo
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Prijava v Frappe
            </DialogTitle>
            <DialogDescription>
              Vnesi svoje Frappe poverilnice za dostop do realnih podatkov
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Uporabniško ime / E-pošta</Label>
              <Input
                placeholder="administrator"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Geslo</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {connectionError && (
              <p className="text-sm text-red-600">{connectionError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setLoginDialogOpen(false)}>
                Prekliči
              </Button>
              <Button
                onClick={handleLogin}
                disabled={isConnecting || !username || !password}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Prijavljam...
                  </>
                ) : (
                  'Prijava'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
