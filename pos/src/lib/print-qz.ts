import qz from 'qz-tray';
import { KEYUTIL, KJUR, stob64, hextorstr } from 'jsrsasign';
import { call } from './frappe-sdk-retry';
import { getErrorMessage } from './error-utils';

// SECURITY: Private key is fetched at runtime from the authenticated backend API
// (ury.ury.api.ury_print.signature_promise). This ensures the key is never bundled
// into the client JS and is only available to authenticated users.
let privateKey: string | undefined;
let privateKeyExpiry: number = 0;
const KEY_TTL = 5 * 60 * 1000; // 5 minutes (POS-R36-007)
let certLoaded = false;
// R42-FIX: Track in-flight cert loading to prevent concurrent double-setup.
// Previously, two concurrent loadQzPrinter() calls could both see certLoaded=false
// and both execute setCertificatePromise, causing the second to overwrite the
// first — leading to QZ Tray signature validation failures.
let certLoadPromise: Promise<void> | null = null;

async function loadPrivateKey(): Promise<string> {
  if (privateKey !== undefined && Date.now() < privateKeyExpiry) return privateKey;
  try {
    const response = await call.get('ury.ury.api.ury_print.signature_promise');
    privateKey = response.message;
    privateKeyExpiry = Date.now() + KEY_TTL;
    if (!privateKey) {
      throw new Error('Private key not configured in site_config (qz_private_key)');
    }
    return privateKey;
  } catch (err) {
    throw new Error(`Failed to load QZ signing key from server: ${getErrorMessage(err)}`);
  }
}

export async function loadQzPrinter(host: string): Promise<void> {
  // R42-FIX: Deduplicate concurrent cert loading. If a cert load is already
  // in-flight, await the same promise instead of starting a second one.
  if (!certLoaded && !certLoadPromise) {
    certLoadPromise = (async () => {
      const cert = await call.get('ury.ury.api.ury_print.qz_certificate');
      const certPem = cert.message;
      if (!certPem) {
        throw new Error('QZ certificate not configured in site_config (qz_cert)');
      }
      qz.security.setCertificatePromise(
        (resolve: (data: string) => void, _reject: (err?: string) => void) => {
          resolve(certPem);
        }
      );
      certLoaded = true;
    })();
  }
  if (certLoadPromise) {
    await certLoadPromise;
    // Clear the promise after successful resolution so future calls don't
    // await a stale promise if certLoaded was reset by a disconnect.
    certLoadPromise = null;
  }

  if (!qz.websocket.isActive()) {
    // R39-FIX: Use env variable instead of insecure window global.
    // VITE_QZ_INSECURE can be set to "true" in .env for development only.
    // Previously used `(window as any).__QZ_INSECURE__` which any script could set.
    const usingSecure = import.meta.env.VITE_QZ_INSECURE !== 'true';
    await qz.websocket.connect({ host, usingSecure });

    // R39-FIX: Reset certLoaded on WebSocket disconnect so the next print
    // attempt will re-establish the certificate promise. Without this, a
    // disconnect-then-reconnect cycle skips cert setup, causing silent failures.
    // R42-FIX: Also clear certLoadPromise so the next call can start a fresh load.
    qz.websocket.connectionPromise?.catch?.(() => { certLoaded = false; certLoadPromise = null; });
  }
}

export function disconnectQzPrinter(): void {
  if (qz.websocket.isActive()) {
    qz.websocket.disconnect();
    // R39-FIX: Reset certLoaded on explicit disconnect too
    certLoaded = false;
  }
}

export async function printWithQz(host: string, htmlToPrint: string): Promise<void> {
  qz.security.setSignatureAlgorithm('SHA512');
  qz.security.setSignaturePromise((toSign: string) => async (resolve: (sig: string) => void, reject: (err?: string) => void) => {
    try {
      const pk = await loadPrivateKey();
      const key = KEYUTIL.getKey(pk);
      const sig = new KJUR.crypto.Signature({ alg: 'SHA512withRSA' });
      sig.init(key);
      sig.updateString(toSign);
      const hex = sig.sign();
      resolve(stob64(hextorstr(hex)));
    } catch (err) {
      reject(String(err));
    }
  });

  const printing = async () => {
    const printer = await qz.printers.getDefault();
    if (!printer) {
      throw new Error('No default printer configured in QZ Tray');
    }
    const data = [{ type: 'html', format: 'plain', data: htmlToPrint }];
    const config = qz.configs.create(printer);
    await qz.print(config, data as [{ type: string; format: string; data: string }]);
  };

  if (qz.websocket.isActive()) {
    await printing();
  } else {
    await loadQzPrinter(host);
    await printing();
  }
}

export function clearPrivateKey(): void {
  privateKey = undefined;
  privateKeyExpiry = 0;
}
