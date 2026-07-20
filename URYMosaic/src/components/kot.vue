<template>
  <div class="mx-auto p-6 mb-16 relative">
    <!-- Alert Modal div start-->
    <div
      v-if="showModal"
      ref="authModal"
      tabindex="-1"
      class="fixed inset-0 z-[60] overflow-y-auto modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      @keydown="handleModalKeydown"
    >
      <div class="flex items-center justify-center">
        <div class="w-full rounded-lg bg-white p-6 shadow-lg md:max-w-md">
          <p
            id="modal-title"
            class="block text-left text-xl font-medium text-gray-700 dark:text-gray-300"
          >
            <span
              class="w-3 h-3 rounded-full inline-block mr-1 bg-red-500"
            ></span>
            {{ modalTitle }}
          </p>
          <hr class="border-gray-200" />

          <p id="modal-description" class="text-left text-xl mt-6 font-medium text-gray-500">
            {{ modalMessage }}
          </p>

          <div class="flex justify-center">
            <button
              @click="
                showModal = false;
                redirectToLogin();
              "
              class="mt-8 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Alert Modal div end-->

    <div
      class="relative"
    >
      <div v-for="kot in visibleKots" :key="kot.name">
        <div
          :class="[kot.color]"
          class="shadow-lg gap-4 p-3 rounded-2xl max-w-80 w-full h-auto masonry-item mt-7"
          role="group"
          :aria-label="`${kot.tableortakeaway}, Order ${kot.order_no || (kot.invoice ? String(kot.invoice).slice(-4) : '—')}, ${kot.timeRemaining} elapsed`"
        >
          <div class="w-64">
            <div
              :class="[{ hidden: !kot.isRotated }]"
              @click="rotateCard(kot)"
              @keydown.enter="rotateCard(kot)"
              @keydown.space.prevent="rotateCard(kot)"
              role="button"
              tabindex="0"
              :aria-label="kot.isRotated ? 'Hide order actions' : 'Show order actions'"
              class="absolute inset-0 bg-white z-50 opacity-80 rounded-2xl flex flex-col justify-center items-center"
            >
              <button
                @click.stop="
                  kot.type === 'Cancelled' || kot.type === 'Partially cancelled'
                    ? confirmOrder(kot)
                    : serveOrder(kot)
                "
                :class="[{ hidden: !kot.isRotated }]"
                class="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                {{
                  kot.type === "Cancelled" || kot.type === "Partially cancelled"
                    ? "Confirm"
                    : "Serve"
                }}
              </button>
            </div>

              <!-- Card Header: Table Name and Order Number -->
              <div class="flex justify-between" @click="rotateCard(kot)" @keydown.enter="rotateCard(kot)" @keydown.space.prevent="rotateCard(kot)" role="button" :tabindex="kot.isRotated ? -1 : 0" aria-label="Toggle order actions">
                <div class="text-sm w-48">
                  <span
                    v-if="kot.tableortakeaway !== 'Takeaway'"
                    class="text-sm font-medium text-[#6B7280]"
                    >Table
                  </span>
                  <span class="text-gray-900 font-semibold">
                    {{ kot.tableortakeaway }}
                    <!-- R42-FIX: Guard against null/undefined user — prevents "( )" display -->
                    <span v-if="kot.user" class="text-sm font-medium text-[#6B7280]"
                      >( {{ kot.user }} )</span
                    ></span
                  ><br />
                  <span v-if="kot.is_aggregator" class="text-sm font-medium text-[#6B7280]">Aggregator</span>
                  <span v-if="kot.is_aggregator" class="text-gray-900 ml-2 font-semibold"
                    >{{ kot.customer_name }}
                  </span><br v-if="kot.is_aggregator" />
                  <span v-if="kot.is_aggregator" class="text-sm font-medium text-[#6B7280]">Aggregator ID</span>
                  <span v-if="kot.is_aggregator" class="text-gray-900 ml-2 font-semibold"
                    >{{ kot.aggregator_id }}
                  </span><br v-if="kot.is_aggregator"/>
                  <span class="text-sm font-medium text-[#6B7280]">Order</span>
                  <span class="text-gray-900 ml-2 font-semibold"
                    >{{ Number(daily_order_number) === 1 ? kot.order_no : (kot.invoice ? String(kot.invoice).slice(-4) : '—') }}
                    
                  </span>
                  <span
                    class="text-gray-900 ml-2 font-semibold"
                    v-if="
                      kot.type === 'Partially cancelled' ||
                      kot.type === 'Cancelled'
                    "
                  >
                    ( {{ kot.type }} )</span
                  >
                </div>
                <div
                  :class="kot.timecolor"
                  class="font-semibold text-2xl leading-10"
                >
                  {{ kot.timeRemaining }}
                </div>
              </div>
              <div
                v-if="kot.type === 'Duplicate'"
                class="text-[#DC0000] font-medium"
              >
                ( Duplicate KOT ( CHECK WITH CAPTAIN ) )
              </div>
              <div v-if="kot.comments" class="text-[#6B7280] font-medium">
                ( {{ kot.comments }} )
              </div>
              <div>
                <div
                  class="font-semibold justify-between items-center mt-2"
                  v-for="kotitem in sortedKotItems(kot)"
                  :key="kotitem.name"
                >
                  <div
                    @click="toggleItemStrikeThrough(kotitem, kot)"
                    @keydown.enter="toggleItemStrikeThrough(kotitem, kot)"
                    @keydown.space.prevent="toggleItemStrikeThrough(kotitem, kot)"
                    :class="{
                      'line-through text-green-700': kotitem.striked,
                    }"
                    role="button"
                    tabindex="0"
                    :aria-label="kotitem.striked ? `Unmark ${kotitem.item_name}` : `Mark ${kotitem.item_name} done`"
                    class="flex font-semibold justify-between items-center"
                  >
                    <div>
                      <span class="ml-2 text-gray-900">{{
                        kotitem.item_name
                      }}<span v-show="kotitem.indicate_course" class="text-sm text-gray-500 ml-1"> ( {{kotitem.course}} )</span>
                      </span
                      ><br />
                      <span
                        class="ml-2 text-gray-900"
                        v-if="
                          kot.type === 'Partially cancelled' ||
                          kot.type === 'Cancelled'
                        "
                        >[Old Qty = {{ kotitem.quantity }}]</span
                      >
                    </div>
                    <div>
                      <span class="ml-2 text-gray-900">{{ kotitem.qty }}</span>
                    </div>
                  </div>
                  <div>
                    <p
                      v-if="kotitem.comments"
                      class="ml-2 text-[#6B7280] font-medium"
                    >
                      {{ kotitem.comments }}
                    </p>
                    <hr class="my-1 border-gray-200 mt-2" />
                  </div>
                </div>
              </div>
            
          </div>
        </div>
      </div>
    </div>

    <!-- Audio Alert Message -->
    <div
      v-if="showAudioAlertMessage"
      role="alert"
      class="absolute top-1 left-1/2 transform -translate-x-1/2 p-2 font-bold text-2xl text-red-500 text-center"
    >
      Audio notifications disabled. Click anywhere to enable.
    </div>

    <div
      v-if="statusMessage"
      :class="[
        'fixed',
        'bottom-10',
        'right-10',
        'p-4',
        'rounded',
        'text-white',
        {
          'bg-green-500': isOnline,
          'bg-red-500': !isOnline,
        },
      ]"
      role="status"
      aria-live="polite"
    >
      {{ statusMessage }}
    </div>
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      {{ visibleKots.length }} order{{ visibleKots.length !== 1 ? 's' : '' }} displayed
    </div>
  </div>
</template>

<script>
import { FrappeApp } from "frappe-js-sdk";
import Masonry from "masonry-layout";
import io from "socket.io-client";
import { markRaw } from "vue";

let host = window.location.hostname;
let port = window.location.port;
let protocol = window.location.protocol;
let url = port ? `${protocol}//${host}:${port}` : `${protocol}//${host}`;
// R37-REMOVED: module-level siteName and alertAudio — siteName was shared mutable state (race condition risk),
// alertAudio was unused after R36 moved to instance-level this._alertAudio

// R41-FIX: Add cancel() method to debounce return value so pending timers
// can be cleaned up on component unmount, preventing post-unmount masonry calls.
function debounce(fn, delay) {
    let timer = null;
    const debounced = function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
    debounced.cancel = () => { clearTimeout(timer); timer = null; };
    return debounced;
}

// R37-FIX: fetchAndSetSiteName now returns siteName instead of mutating module-level state
// R49-FIX: Accept optional AbortSignal so callers can cancel the fetch
// on component unmount. Without this, the network request continues
// consuming resources even after the component is destroyed.
async function fetchSiteName(signal) {
    try {
        const response = await fetch('/api/method/ury.ury.api.ury_kot_display.get_site_name', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            ...(signal ? { signal } : {})
        });
        if (!response.ok) {
            if (import.meta.env?.DEV) console.error('fetchSiteName: response not ok, status', response.status);
            return '';
        }
        const data = await response.json();
        return data?.message?.site_name || '';
    } catch (error) {
        if (import.meta.env?.DEV) console.error('Failed to fetch site name:', error);
        return '';
    }
}

// R49-FIX: Accept optional AbortSignal to pass through to fetchSiteName
// and abort socket init on component unmount.
async function initializeSocket(signal) {
    // R37-FIX: Use local variable instead of module-level shared state
    const siteName = await fetchSiteName(signal);
    if (siteName) {
        let site_url = `${url}/${siteName}`;
        const sock = io(site_url, {
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });
        return sock;
    } else {
        if (import.meta.env?.DEV) console.error('Site name is not set. Socket cannot be initialized.');
        return null;
    }
}




const frappe = new FrappeApp(url);
export default {
  inject: ['authState'],
  data() {
    return {
      kot: [],
      production: "",
      branch: "",
      kot_channel: "",
      // R49-FIX (L1): Removed loggeduser from reactive data — it was set
      // from auth() but never used in the template or any method output.
      // Keeping it as a reactive property incurred unnecessary Proxy overhead
      // and made the data() return value misleading.
      showModal: false,
      // R41-FIX: Dynamic modal content — differentiates auth errors from
      // network/server errors instead of always showing "Not Permitted".
      modalTitle: "Connection Error",
      modalMessage: "Unable to reach the server. Please check your connection and try again.",
      kot_alert_time: "",
      showAudioAlertMessage: false,
      audio_alert: 0,
      isOnline: navigator.onLine,
      statusMessage: "",
      daily_order_number:0,
      // R37-FIX: socketHandler moved to created() as non-reactive to avoid Proxy overhead
    };
  },
  // R39-FIX: Error boundary — catches rendering errors from child components
  // or template expressions, logs them, and shows a user-friendly message
  // instead of crashing the entire KDS display.
  // R40-FIX: Added recursion guard — if fetchKOTWithRetry itself causes a
  // rendering error (unlikely but possible), we'd re-enter errorCaptured
  // and trigger another fetchKOTWithRetry, potentially infinitely.
  errorCaptured(err, instance, info) {
    if (import.meta.env?.DEV) console.error('KDS rendering error:', err, info);
    if (!this._errorCapturedRecovering) {
      this._errorCapturedRecovering = true;
      this.setStatusMessage('Display error — refreshing...');
      this.hideStatusMessageAfterDelay();
      // Attempt recovery by re-fetching KOT data (with retry for transient errors)
      // R43-FIX: Remove redundant .then(() => masonryLoading()) — fetchKOT()
      // already calls masonryLoading(true) on success.
      this.fetchKOTWithRetry().catch(() => {}).finally(() => {
        this._errorCapturedRecovering = false;
      });
    }
    // Return false to prevent the error from propagating further up
    return false;
  },
  methods: {
    // M1-FIX: Focus trap for auth modal — cycles focus within the dialog on Tab/Shift+Tab
    handleModalKeydown(e) {
      // R49-FIX: Allow Escape to dismiss the auth modal.
      // Per ARIA dialog pattern and WCAG 2.1.2, dialogs must be
      // dismissible via Escape key. Without this, keyboard-only users
      // are trapped — the only close path was the Login button.
      if (e.key === 'Escape') {
        e.preventDefault();
        this.showModal = false;
        this.redirectToLogin();
        return;
      }
      if (e.key !== 'Tab') return;
      const modal = e.currentTarget;
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    },
    playAlertSound(path) {
      if (!path) return; // R37-FIX: Guard against null/undefined audio path
      const currentDomain = window.location.origin;
      const audio_path = currentDomain + path;
      // R36-FIX: Use instance-level audio to avoid cross-instance conflicts
      if (!this._alertAudio) {
        this._alertAudio = new Audio(audio_path);
      } else {
        // R41-FIX: If same source is already playing, just restart from beginning.
        // Setting .src to the same value causes an unnecessary load delay and can
        // trigger AbortError in some browsers when the pending play() is interrupted.
        if (this._alertAudio.src !== audio_path) {
          this._alertAudio.src = audio_path;
        }
      }
      // R41-FIX: Reset to start so rapid alerts replay the sound from the top
      this._alertAudio.currentTime = 0;
      this._alertAudio.play().catch((err) => {
        // R41-FIX: AbortError means a new play() interrupted an ongoing one —
        // audio IS working, so don't show the "disabled" message.
        // NotAllowedError is the real autoplay restriction.
        if (err && err.name === 'AbortError') return;
        // R36-FIX: Show UI fallback when audio fails — kitchen staff need to know
        if (!this._isMounted) return; // R37-FIX: Guard against post-unmount
        if (err && err.name === 'NotAllowedError') {
          this.showAudioAlertMessage = true;
        } else {
          this.setStatusMessage("Audio alert unavailable. Check sound settings.");
          this.hideStatusMessageAfterDelay();
        }
      });
    },
    // R40-FIX: Removed unnecessary new Promise() wrapper — frappe.auth().getLoggedInUser()
    // already returns a Promise. The old pattern was an anti-pattern that added nesting
    // and lost stack traces on rejection.
    auth() {
      return frappe.auth().getLoggedInUser()
        .then((user) => {
          // R50-FIX (L1): Removed dead _loggedUser assignment — never read anywhere.
          // Update shared auth state so route guard works
          if (this.authState) {
            this.authState.isLoggedIn = true;
          }
        })
        .catch((error) => {
          if (import.meta.env?.DEV) console.error(error);
          // R41-FIX: Mark auth as failed so the route guard doesn't trap
          // the user in a loop (Home → modal "Login" → Login page →
          // guard redirects back to Home because isLoggedIn is still true).
          if (this.authState) {
            this.authState.isLoggedIn = false;
          }
          throw error; // Re-throw so callers can catch
        });
    },
    fetchKOT() {
      // Deduplicate concurrent fetchKOT calls to prevent state corruption
      if (this._fetchInProgress) return this._fetchInProgress;
      // R47-FIX (H2): Capture fetch generation to detect if a newer fetch
      // was started while this one was in-flight. If so, discard results.
      const fetchId = this._fetchId;
      // R46-FIX (H1): Capture current production so we can detect if the
      // station changed while the network request was in-flight. If it did,
      // the response belongs to the old station and must be discarded.
      const currentProduction = this.production;
      // M7-FIX: AbortController with 15-second timeout for API requests
      // R47-FIX (H1): Use native fetch() instead of Frappe SDK so the
      // AbortController signal is actually connected to the network request.
      // The SDK's .get() does not accept a signal parameter, making the
      // timeout dead code. Raw fetch() with signal enables real cancellation.
      // R48-FIX (M1): Abort any previous in-flight fetch before starting a new one.
      // Without this, station changes and reconnects leave stale fetches running —
      // their responses may arrive after the new station's data is already displayed,
      // overwriting it with old-station data or triggering redundant re-renders.
      if (this._fetchAbortController) {
        this._fetchAbortController.abort();
      }
      const controller = new AbortController();
      this._fetchAbortController = controller;
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const promise = new Promise((resolve, reject) => {
        try {
          fetch('/api/method/ury.ury.api.ury_kot_display.kot_list', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            signal: controller.signal,
          })
            .then(response => {
              if (!response.ok) {
                const err = new Error(`HTTP ${response.status}: ${response.statusText}`);
                err.httpStatus = response.status;
                throw err;
              }
              return response.json();
            })
            .then((result) => {
              clearTimeout(timeoutId);
              // R47-FIX (H2): A newer fetch started while this one was in-flight — discard
              if (this._fetchId !== fetchId) { resolve(); return; }
              if (!this._isMounted) { resolve(); return; }
              // R46-FIX (H1): Station changed while fetch was in-flight — discard stale data
              if (this.production !== currentProduction) { resolve(); return; }
              // R37-FIX: Null-check result.message to prevent TypeError crash
              const msg = result?.message;
              if (!msg) { resolve(); return; }
              if (!Array.isArray(msg.KOT)) {
                if (import.meta.env?.DEV) console.error('Unexpected kot_list response:', msg);
                resolve();
                return;
              }
              this.branch = msg.Branch;
              this.kot_alert_time = msg.kot_alert_time;
              this.audio_alert = msg.audio_alert;
              this.daily_order_number = msg.daily_order_number;
              // R39-FIX: Clean up notifiedKots entries for KOTs that no longer exist.
              // Previously this was .clear(), which caused a notification flood on reconnect
              // — every KOT at the alert threshold would re-trigger orderDelayNotify.
              // Now we only prune entries whose KOTs have been removed, preserving
              // the "already notified" state for KOTs that still exist.
              const activeKotNames = new Set((msg.KOT || []).map(k => k.name));
              for (const name of [...this.notifiedKots]) {
                if (!activeKotNames.has(name)) {
                  this.notifiedKots.delete(name);
                }
              }
              // R43-FIX: Clean up orphaned localStorage strike-through keys.
              // When KOTs are removed server-side (served/cancelled without going
              // through the KDS UI), their _strike keys accumulate in localStorage
              // indefinitely. Over time this causes updateQtyColorTable's full-scan
              // to slow down and wastes storage. Only keep keys for current KOTs.
              try {
                const validStrikeKeys = new Set();
                (Array.isArray(msg.KOT) ? msg.KOT : []).forEach(k => {
                  if (k.kot_items) {
                    k.kot_items.forEach(item => {
                      validStrikeKeys.add(`${k.name}_${item.name}_strike`);
                    });
                  }
                });
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.endsWith('_strike') && !validStrikeKeys.has(key)) {
                    keysToRemove.push(key);
                  }
                }
                keysToRemove.forEach(key => {
                  try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
                });
              } catch (e) {
                if (import.meta.env?.DEV) console.error('localStorage cleanup failed:', e);
              }
              const newChannel = `kot_update_${this.branch}_${this.production}`;
              // R38-FIX: Always remove old listener before adding to prevent duplicate registrations.
              // Previously, off() only ran when channel changed, so repeated fetchKOT() calls
              // with the same channel accumulated duplicate listeners, causing N executions per event.
              if (this.kot_channel && this._socket && this.socketHandler) {
                this._socket.off(this.kot_channel, this.socketHandler);
              }
              this.kot_channel = newChannel;
              if (this._socket && this.socketHandler) {
                this._socket.on(this.kot_channel, this.socketHandler);
              }
              // R37-FIX: Invalidate sorted items cache on full refresh
              this._sortedItemsCache.clear();
              // R39-FIX: Removed showDiv: false — it was always false (dead code)
              // and needlessly added a reactive property to every KOT object.
              // R43-FIX: Guard against non-array msg.KOT — if the server returns
              // a non-array truthy value (e.g., an error object), .map() would throw.
              this.kot = (Array.isArray(msg.KOT) ? msg.KOT : []).map(k => ({
                isRotated: false, timecolor: 'text-black', timeRemaining: '— : —', ...k
              }));
              this.updateQtyColorTable();
              this.updateTimeRemaining();
              this.masonryLoading();
              // R50-FIX (M1): Record last successful fetch time for dedup
              this._lastFetchTime = Date.now();
              resolve();
            })
            .catch((error) => {
              clearTimeout(timeoutId);
              if (import.meta.env?.DEV) console.error(error);
              // M7-FIX: Convert abort errors to timeout errors for clearer messaging
              // R47-FIX (H1): Native fetch throws DOMException with name 'AbortError'
              // when the signal fires. The SDK's ERR_CANCELED (axios) is no longer
              // possible since we bypass the SDK for this call.
              if (error.name === 'AbortError') {
                reject(new Error('Request timed out after 15 seconds'));
              } else {
                reject(error);
              }
            });
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      }).finally(() => {
        clearTimeout(timeoutId);
        // R47-FIX (H2): Only clear _fetchInProgress if it still refers to
        // THIS promise. A newer concurrent fetch may have set its own promise,
        // and unconditionally clearing would wipe the newer fetch's guard.
        if (this._fetchInProgress === promise) {
          this._fetchInProgress = null;
        }
        // R49-FIX (L2): Null out _fetchAbortController after the fetch
        // completes so handleOnline/beforeUnmount don't attempt to abort
        // an already-settled request (harmless but wasteful), and so the
        // GC can reclaim the controller sooner.
        if (this._fetchAbortController === controller) {
          this._fetchAbortController = null;
        }
      });
      this._fetchInProgress = promise;
      return promise;
    },
    rotateCard(kot) {
      // R39-FIX: Removed masonryLoading() call — the card overlay is
      // position:absolute and doesn't change the card's dimensions, so
      // a full masonry re-layout is unnecessary and caused layout thrashing
      // on every card click.
      kot.isRotated = !kot.isRotated;
    },
    confirmOrder(kot) {
      if (this._inflightOps && this._inflightOps.has(kot.name)) return;
      if (this._cancelTimeout) { clearTimeout(this._cancelTimeout); this._cancelTimeout = null; }
      if (!this.kot.find(k => k.name === kot.name)) return; // R50-FIX: Pre-flight check
      this._markInflight(kot.name);
      // R50-FIX (H2): Store controller on instance so it can be aborted on unmount
      if (this._mutateAbortController) this._mutateAbortController.abort();
      const controller = new AbortController();
      this._mutateAbortController = controller;
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      fetch('/api/method/ury.ury.api.ury_kot_display.confirm_cancel_kot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': window.csrf_token || '' },
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify({ name: kot.name }),
      })
        .then(response => {
          if (!response.ok) {
            const err = new Error(`HTTP ${response.status}: ${response.statusText}`);
            err.httpStatus = response.status;
            throw err;
          }
          return response.json();
        })
        .then(() => {
          clearTimeout(timeoutId);
          if (!this._isMounted) return;
          const idx = this.kot.findIndex(k => k.name === kot.name);
          if (idx !== -1) this.kot.splice(idx, 1);
          this.removeAllItemsFromLocalStorage(kot);
          this.notifiedKots.delete(kot.name);
          this._sortedItemsCache.delete(kot.name);
          this.masonryLoading();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          this._handleFetchError(error, "Action failed. Please try again.");
        })
        .finally(() => { this._clearInflight(kot.name); });
    },
    serveOrder(kot) {
      if (this._inflightOps && this._inflightOps.has(kot.name)) return;
      if (this._cancelTimeout) { clearTimeout(this._cancelTimeout); this._cancelTimeout = null; }
      if (!this.kot.find(k => k.name === kot.name)) return; // R50-FIX: Pre-flight check
      this._markInflight(kot.name);
      // R50-FIX (H2): Store controller on instance so it can be aborted on unmount
      if (this._mutateAbortController) this._mutateAbortController.abort();
      const controller = new AbortController();
      this._mutateAbortController = controller;
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      fetch('/api/method/ury.ury.api.ury_kot_display.serve_kot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': window.csrf_token || '' },
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify({ name: kot.name }),
      })
        .then(response => {
          if (!response.ok) {
            const err = new Error(`HTTP ${response.status}: ${response.statusText}`);
            err.httpStatus = response.status;
            throw err;
          }
          return response.json();
        })
        .then(() => {
          clearTimeout(timeoutId);
          if (!this._isMounted) return;
          const idx = this.kot.findIndex(k => k.name === kot.name);
          if (idx !== -1) this.kot.splice(idx, 1);
          this.removeAllItemsFromLocalStorage(kot);
          this.notifiedKots.delete(kot.name);
          this._sortedItemsCache.delete(kot.name);
          this.masonryLoading();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          this._handleFetchError(error, "Action failed. Please try again.");
        })
        .finally(() => { this._clearInflight(kot.name); });
    },

    // R42-FIX: Return the promise so callers can chain on success/failure.
    // Previously, the .catch() swallowed the error and returned undefined,
    // making it impossible for callers to know whether the notification succeeded.
    // R50-FIX (C1): Replace Frappe SDK call with raw fetch + AbortController (15s timeout)
    // to prevent hung promises accumulating on server issues. Also add retry limit
    // per KOT to avoid infinite retry loops on persistent failures.
    orderDelayNotify(kot) {
      // R50-FIX: Retry limit — skip if this KOT has failed 3+ times consecutively
      if (!this._notifiedFailCount) this._notifiedFailCount = new Map();
      const failCount = this._notifiedFailCount.get(kot.name) || 0;
      if (failCount >= 3) return Promise.resolve();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const baseUrl = window.frappe?.boot?.frappe_url || '';
      const url = `${baseUrl}/api/method/ury.ury.api.ury_kot_notification.order_delay_notification`;

      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Frappe-CSRF-Token': window.csrf_token || '',
        },
        body: JSON.stringify({ id: kot.name }),
        signal: controller.signal,
      })
        .then((response) => {
          clearTimeout(timeoutId);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then(() => {
          // R50-FIX: Reset fail count on success
          this._notifiedFailCount.delete(kot.name);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          // R50-FIX: Increment fail count on failure
          this._notifiedFailCount.set(kot.name, failCount + 1);
          if (import.meta.env?.DEV) console.error('orderDelayNotify failed:', error);
          throw error;
        });
    },
    toggleItemStrikeThrough(kotitem, kot) {
      // R41-FIX: Guard against null/undefined names — if kot.name or
      // kotitem.name is null, the localStorage key would be "null_undefined_strike",
      // which is corrupt and would never be cleaned up by removeAllItemsFromLocalStorage.
      if (!kot.name || !kotitem.name) return;
      kotitem.striked = !kotitem.striked;
      try {
        localStorage.setItem(
          `${kot.name}_${kotitem.name}_strike`,
          JSON.stringify(kotitem.striked)
        );
      } catch (e) {
        if (import.meta.env?.DEV) console.error('localStorage write failed:', e);
      }
    },

    updateColorandTable(kot, restaurant_table, type, table_takeaway) {
      if (restaurant_table === undefined) {
        kot.tableortakeaway = "Takeaway";
      } else {
        if (Number(table_takeaway) === 1) {
          kot.tableortakeaway = "Takeaway";
        } else {
          kot.tableortakeaway = restaurant_table;
        }
      }
      if (type === "Order Modified") {
        kot.color = "bg-[#FFD493] border border-[#FFC700]";
      } else if (type === "Partially cancelled" || type === "Cancelled") {
        kot.color = "bg-[#FFD2D2] border border-[#FAA7A7]";
      } else if (restaurant_table === undefined || Number(table_takeaway) === 1) {
        kot.color = "bg-blue-100 border border-blue-200";
      } else {
        kot.color = "bg-white";
      }
    },
    updateQtyColorTable() {
      // R43-FIX: Read only relevant localStorage keys instead of iterating ALL
      // localStorage keys. The old approach scanned every key in localStorage
      // (including unrelated Frappe keys), which was O(localStorage.length) and
      // slowed down as orphaned _strike keys accumulated. Now we read only the
      // keys for current KOT items: O(kots * items) getItem calls, which is
      // typically 50-500 vs potentially thousands of localStorage keys.
      this.kot.forEach((kot) => {
        this._updateSingleKotQtyColor(kot);
      });
    },
    // R44-FIX: Extract single-KOT processing from updateQtyColorTable so the
    // incremental socket path can update just the affected KOT in O(1) instead
    // of re-processing ALL KOTs in O(n) on every socket event.
    _updateSingleKotQtyColor(kot) {
      this.updateColorandTable(
        kot,
        kot.restaurant_table,
        kot.type,
        kot.table_takeaway
      );

      // R37-FIX: Null-check kot_items before forEach
      if (!kot.kot_items) return;
      kot.kot_items.forEach((kotitem) => {
        const key = `${kot.name}_${kotitem.name}_strike`;
        try {
          const savedState = localStorage.getItem(key);
          if (savedState !== null) {
            try {
              kotitem.striked = JSON.parse(savedState);
            } catch (e) {
              kotitem.striked = false;
            }
          }
        } catch (e) {
          // localStorage access can fail in private browsing mode
        }
        this.calculateQty(
          kotitem,
          kotitem.quantity,
          kot.type,
          kotitem.cancelled_qty
        );
      });
    },
    // R39-FIX: Moved from computed (which returned a function) to method.
    // As a method, the function identity is stable and the manual
    // _sortedItemsCache still provides memoization per KOT.
    sortedKotItems(kot) {
      const items = kot.kot_items || [];
      const key = `${kot.name}:${items.length}:${items.map(i => i.name).join(',')}`;
      const cached = this._sortedItemsCache.get(kot.name);
      if (cached && cached.key === key) {
        return cached.items;
      }
      const sorted = [...items].sort((a, b) => (a.serve_priority || 0) - (b.serve_priority || 0));
      this._sortedItemsCache.set(kot.name, { key, items: sorted });
      return sorted;
    },
    calculateQty(kotitem, qty, type, cancelled_qty) {
      // R37-FIX: Guard against negative quantities from cancelled_qty > qty
      if (type === "Partially cancelled" || type === "Cancelled") {
        kotitem.qty = Math.max(0, qty - cancelled_qty);
      } else {
        kotitem.qty = qty;
      }
    },
    removeAllItemsFromLocalStorage(kot) {
      // R38-FIX: Remove strike-state keys for this KOT's items by known key pattern
      // instead of iterating ALL localStorage keys (which may include unrelated Frappe keys).
      if (!kot.kot_items) return;
      kot.kot_items.forEach((kotitem) => {
        try {
          localStorage.removeItem(`${kot.name}_${kotitem.name}_strike`);
        } catch (e) {
          if (import.meta.env?.DEV) console.error('localStorage removeItem failed:', e);
        }
      });
    },

    updateTimeRemaining() {
      this.visibleKots.forEach((kot) => {
        this._updateSingleKotTimeRemaining(kot);
      });
    },
    // R44-FIX: Extract single-KOT time processing from updateTimeRemaining so
    // the incremental socket path can update just the affected KOT in O(1)
    // instead of re-processing ALL KOTs in O(n) on every socket event.
    _updateSingleKotTimeRemaining(kot) {
      kot.timeRemaining = this.calculateTimeRemaining(kot.time);

      const timeRemaining = kot.timeRemaining.split(":");
      const minutes =
        parseInt(timeRemaining[0], 10) * 60 + parseInt(timeRemaining[1], 10);

      // R47-FIX (L3): Skip delay notifications when time is invalid.
      // When calculateTimeRemaining returns '— : —' (missing/malformed time),
      // parseInt produces NaN → Infinity, which falsely passes the >= threshold check.
      const hasValidTime = !isNaN(minutes);

      // R36-FIX: Handle NaN from invalid time format — treat as elapsed time exceeded
      const validMinutes = isNaN(minutes) ? Infinity : minutes;

      if (
        // R41-FIX: Use >= instead of === for alert threshold comparison.
        hasValidTime &&
        validMinutes >= Number(this.kot_alert_time) &&
        kot.type !== "Cancelled" &&
        kot.type !== "Partially cancelled" &&
        !this.notifiedKots.has(kot.name) &&
        this.isOnline && // R45-FIX: Skip delay notification when offline — avoids wasteful
                     // failed API calls every minute for each KOT past the alert threshold.
        !this._notificationCooldown // R46-FIX (H2): Skip during 30s post-mount cooldown
      ) {
        // R42-FIX: Mark as notified AFTER the API call succeeds, not before.
        const kotName = kot.name;
        this.orderDelayNotify(kot).then(() => {
          // R48-FIX (L1): Guard against post-unmount state mutation
          if (!this._isMounted) return;
          this.notifiedKots.add(kotName);
        }).catch(() => {
          // Notification failed — don't add to notifiedKots so it retries
          if (import.meta.env?.DEV) console.warn('orderDelayNotify failed, will retry on next tick:', kotName);
        });
      }
      // R38-FIX: Guard against empty/falsy kot_alert_time.
      // R49-FIX (H1): Also guard with hasValidTime — when calculateTimeRemaining
      // returns '— : —', validMinutes is Infinity, which always passes the >=
      // threshold check, causing KOTs with missing/malformed times to show red.
      // The notification path already skips invalid times (hasValidTime guard),
      // but the color path did not, giving a false visual alert.
      const alertThreshold = Number(this.kot_alert_time);
      if (hasValidTime && alertThreshold > 0 && validMinutes >= alertThreshold) {
        kot.timecolor = "text-[#DC0000]";
      } else {
        kot.timecolor = "text-black";
      }
    },
    calculateTimeRemaining(targetTime) {
      if (!targetTime || !targetTime.includes(":")) return '— : —';
      const currentTime = new Date();
      // R39-FIX: Guard against malformed time strings with fewer than 3 parts.
      // Previously, "HH:MM" without seconds would set targetSeconds=undefined,
      // which Date() treats as NaN → Invalid Date → NaN propagation.
      const parts = targetTime.split(":");
      const targetHours = parseInt(parts[0], 10);
      const targetMinutes = parseInt(parts[1], 10);
      const targetSeconds = parseInt(parts[2] || '0', 10);
      if (isNaN(targetHours) || isNaN(targetMinutes) || isNaN(targetSeconds)) return '— : —';
      let targetDate = new Date(
        currentTime.getFullYear(),
        currentTime.getMonth(),
        currentTime.getDate(),
        targetHours,
        targetMinutes,
        targetSeconds
      );
      // Handle cross-midnight KOTs: if target is in the future, it was created yesterday
      if (targetDate > currentTime) {
        targetDate = new Date(targetDate.getTime() - 86400000);
      }

      const timeDifference = Math.max(0, currentTime - targetDate);
      const hoursRemaining = Math.floor(timeDifference / 3600000);
      const minutesRemaining = Math.floor((timeDifference % 3600000) / 60000);

      return `${hoursRemaining} : ${String(minutesRemaining).padStart(2, '0')}`;
    },
    // R39-FIX: Retry wrapper for fetchKOT with exponential backoff.
    // Without this, a transient server error leaves the KDS showing stale
    // data indefinitely — the only recovery was a manual page reload.
    fetchKOTWithRetry(maxRetries = 3, initialDelay = 2000) {
      // R41-FIX: Clear any pending retry timer before starting a new retry chain.
      // Without this, calling fetchKOTWithRetry() while a previous retry timer is
      // pending would leave the old timer running, potentially causing duplicate
      // fetchKOT calls when both timers fire.
      if (this._fetchRetryTimer) { clearTimeout(this._fetchRetryTimer); this._fetchRetryTimer = null; }
      // R42-FIX: Bump generation counter so any still-running retry chain from
      // a previous fetchKOTWithRetry call knows it's been superseded. Without
      // this, clearing the timer orphans the old promise — its resolve/reject
      // callbacks are never called, leaking the promise and its closures.
      const generation = ++this._fetchGeneration;
      const attempt = (retriesLeft, delay) => {
        // If a newer fetchKOTWithRetry has started, abort this chain
        if (generation !== this._fetchGeneration) {
          return Promise.reject(new Error('Superseded by newer fetchKOTWithRetry call'));
        }
        return this.fetchKOT().catch(err => {
          if (retriesLeft <= 0 || !this._isMounted || generation !== this._fetchGeneration) throw err;
          if (import.meta.env?.DEV) console.warn(`fetchKOT failed, retrying in ${delay}ms...`, err);
          return new Promise((resolve, reject) => {
            this._fetchRetryTimer = setTimeout(() => {
              if (!this._isMounted || generation !== this._fetchGeneration) { reject(err); return; }
              attempt(retriesLeft - 1, Math.min(delay * 2, 30000)).then(resolve).catch(reject);
            }, delay);
          });
        });
      };
      return attempt(maxRetries, initialDelay);
    },
    redirectToLogin() {
      // R38-FIX: Use Vue Router instead of window.location.href to avoid full page reload
      // and preserve app state. The previous approach caused a hard navigation that
      // lost all Vue state and required a full re-initialization.
      this.$router.push({ name: 'Login', query: { route: this.$route.path } });
    },
    masonryLoading(forceRecreate = false) {
      // R40-FIX: Early return if unmounted — prevents post-unmount masonry
      // operations from debounced callbacks, $nextTick, and delayed socket events.
      if (!this._isMounted) return;
      // R39-FIX: Use non-reactive _masonry instead of reactive masonry from data()
      if (this._masonry && !forceRecreate) {
        this.$nextTick(() => {
          // R43-FIX: Re-check _isMounted inside $nextTick callback — component
          // could unmount between the outer _isMounted check and this callback.
          if (!this._isMounted) return;
          if (this._masonry) {
            this._masonry.reloadItems?.();
            this._masonry.layout();
          }
        });
        return;
      }
      if (this._masonry) {
        this._masonry.destroy();
        this._masonry = null;
      }
      this.$nextTick(() => {
        // R43-FIX: Re-check _isMounted inside $nextTick callback
        if (!this._isMounted) return;
        if (!this.$el) return;
        const grid = this.$el.querySelector(".grid");
        if (!grid) return;
        try {
          this._masonry = markRaw(new Masonry(grid, { itemSelector: ".masonry-item", gutter: 28 }));
          this._masonry.layout();
        } catch (e) {
          if (import.meta.env?.DEV) console.error('Masonry init failed:', e);
          this._masonry = null;
        }
      });
    },
    // R45-FIX: Extract auth error detection into reusable method. Previously
    // this logic was duplicated in the socket init chain's .catch() and would
    // be needed again in the connect handler and station watcher.
    _isAuthError(error) {
      return error && (
        error.httpStatus === 401 ||
        error.httpStatus === 403 ||
        /(?:session|csrf|token).*expir|unauthorized|not permitted|authentication_failed/i.test(String(error.message || ''))
      );
    },
    // R45-FIX: Centralized fetch error handler for fetchKOTWithRetry failures.
    // Detects auth expiry (shows login modal) vs other errors (shows status message).
    // Prevents the common pattern of .catch(() => {}) silently swallowing errors,
    // which left users with "Reconnected" message but stale/empty data.
    _handleFetchError(error, fallbackMessage) {
      if (!this._isMounted) return;
      if (this._isAuthError(error)) {
        this.modalTitle = "Session Expired";
        this.modalMessage = "Your session has expired. Please log in again.";
        this.showModal = true;
        if (this.authState) this.authState.isLoggedIn = false;
      } else {
        this.setStatusMessage(fallbackMessage || "Data refresh failed. Click Refresh.");
        this.hideStatusMessageAfterDelay();
      }
    },
    // R49-FIX (H2): Extract socket handler body into a named method so it can
    // be registered independently of the init-chain fetch result. Previously,
    // the handler was defined inside a .then() that was skipped when
    // fetchKOTWithRetry rejected — leaving socketHandler permanently null
    // and the KDS without real-time updates until a full page refresh.
    _handleSocketEvent(doc) {
      if (!this._isMounted) return;
      // R39-FIX: Guard against null/undefined doc from malformed socket messages
      if (!doc) return;
      try {
        if (Number(this.audio_alert) === 1) {
          this.playAlertSound(doc.audio_file);
        }
        // R36-FIX: Namespace localStorage key per production station to avoid cross-tab collision
        // R39-FIX: Normalize null kottime from localStorage — if getItem returns null
        // (no previous value stored) and doc.last_kot_time is also null, they'd be
        // equal and fall through to the incremental path incorrectly. Treat null
        // localStorage value as a signal to do a full refresh.
        let kottime = localStorage.getItem("kot_time_" + this.production);
        if (doc.last_kot_time !== kottime || kottime === null) {
          // R43-FIX: Move localStorage sentinel update AFTER fetchKOT succeeds.
          this.fetchKOTWithRetry().then(() => {
            if (doc.kot && doc.kot.time != null) {
              try {
                localStorage.setItem("kot_time_" + this.production, doc.last_kot_time);
              } catch (e) {
                if (import.meta.env?.DEV) console.error('localStorage write failed:', e);
              }
            }
          }).catch((error) => { this._handleFetchError(error, "Data refresh failed. Click Refresh."); });
          return;
        }
        // R36-FIX: Guard against missing doc.kot to prevent TypeError crash
        // R44-FIX: Also guard against non-object doc.kot (e.g., array, string).
        if (!doc.kot || typeof doc.kot !== 'object' || Array.isArray(doc.kot) || !doc.kot.name) {
          this.fetchKOTWithRetry().catch((error) => { this._handleFetchError(error, "Data refresh failed. Click Refresh."); });
          return;
        }
        // Incremental update — deduplicate to avoid duplicate cards
        const existingIndex = this.kot.findIndex(k => k.name === doc.kot.name);
        let targetKot;
        if (existingIndex !== -1) {
          targetKot = this.kot[existingIndex];
          // R36-FIX: Preserve strikethrough state before Object.assign overwrites kot_items
          const strikeMap = new Map(
            (targetKot.kot_items || []).map(i => [i.name, i.striked])
          );
          // R43-FIX: Exclude 'name' from the spread to prevent overwriting the KOT's
          // primary key.
          const { name: _ignored, ...kotData } = doc.kot;
          Object.assign(targetKot, { timecolor: 'text-black', timeRemaining: '— : —', ...kotData });
          // Restore strikethrough state after Object.assign
          if (targetKot.kot_items) {
            targetKot.kot_items.forEach(i => {
              if (strikeMap.has(i.name)) i.striked = strikeMap.get(i.name);
            });
          }
          // R37-FIX: Invalidate sorted cache for this KOT since items may have changed
          this._sortedItemsCache.delete(doc.kot.name);
        } else {
          // R39-FIX: Removed showDiv: false — dead code
          targetKot = { isRotated: false, timecolor: 'text-black', timeRemaining: '— : —', ...doc.kot };
          this.kot.unshift(targetKot);
        }
        // R44-FIX: Use targeted single-KOT methods instead of processing ALL KOTs.
        this._updateSingleKotQtyColor(targetKot);
        this._updateSingleKotTimeRemaining(targetKot);
        // R50-FIX (C2): Refresh alert settings from incremental payload so
        // KDS reflects manager changes (e.g., alert threshold 15→10 min)
        // without waiting for a full reconnect/refresh.
        if (doc.kot_alert_time != null) this.kot_alert_time = doc.kot_alert_time;
        if (doc.audio_alert != null) this.audio_alert = doc.audio_alert;
        if (doc.daily_order_number != null) this.daily_order_number = doc.daily_order_number;
        // R40-FIX: Use debounced masonry layout for rapid socket events
        this._debouncedMasonryLayout();
        // R41-FIX: Cancel timeout and localStorage write are now ONLY in the incremental path.
        if (this._cancelTimeout) clearTimeout(this._cancelTimeout);
        // R39-FIX: Only schedule cancel re-fetch if the KOT is actually a cancellation.
        if (doc.kot.type === "Cancelled") {
          this._cancelTimeout = setTimeout(() => {
            if (!this._isMounted) return;
            this.fetchKOTWithRetry().catch((error) => { this._handleFetchError(error, "Data refresh failed. Click Refresh."); });
          }, 1500);
        }
        // R41-FIX: Guard against storing null/undefined as string "null"/"undefined"
        if (doc.kot.time != null) {
          try {
            localStorage.setItem("kot_time_" + this.production, doc.last_kot_time);
          } catch (e) {
            if (import.meta.env?.DEV) console.error('localStorage write failed:', e);
          }
        }
      } catch (err) {
        if (import.meta.env?.DEV) console.error("Socket handler error:", err);
      }
    },
    // R41-FIX: In-flight operation tracking for serveOrder/confirmOrder.
    // Prevents duplicate POST requests when the user clicks rapidly.
    _markInflight(kotName) {
      if (!this._inflightOps) this._inflightOps = new Set();
      this._inflightOps.add(kotName);
    },
    _clearInflight(kotName) {
      if (this._inflightOps) this._inflightOps.delete(kotName);
    },
    hideAudioAlertMessage() {
      // R44-FIX: Guard against post-unmount state mutation — click events
      // queued before listener removal could fire after beforeUnmount runs.
      if (!this._isMounted) return;
      // R49-FIX (M2): Only replay audio if the alert message was actually
      // showing. Previously, this handler fired on EVERY click on the page
      // (document.addEventListener), so after an alert sound finished playing
      // naturally (paused=true at end), any subsequent click would replay it
      // from the end — either inaudibly or restarting the alert sound
      // unexpectedly. Now we only replay when the "Click anywhere to enable"
      // message was visible, which is the only case where replay makes sense.
      const wasShowing = this.showAudioAlertMessage;
      this.showAudioAlertMessage = false;
      if (wasShowing && this._alertAudio && this._alertAudio.paused) {
        this._alertAudio.currentTime = 0;
        this._alertAudio.play().catch(() => {});
      }
    },
    handleOnline() {
      // R37-FIX: Guard against post-unmount execution
      if (!this._isMounted) return;
      this.isOnline = true;
      // R50-FIX (H1): Reset disconnected timestamp so that a subsequent
      // connect_error doesn't compute elapsed time from a stale value,
      // producing confusing "Offline for 5+ minutes" right after "You are online".
      this._disconnectedSince = null;
      this.setStatusMessage("You are online");
      this.hideStatusMessageAfterDelay();
      // R46-FIX (H1): Invalidate stale fetch promise so reconnect gets fresh data
      // R48-FIX (M1): Abort any in-flight fetch before invalidating — prevents
      // stale fetch from overwriting data after reconnect.
      if (this._fetchAbortController) {
        this._fetchAbortController.abort();
        this._fetchAbortController = null;
      }
      // R47-FIX (H2): Increment fetch generation so any in-flight fetch discards its results
      this._fetchId++;
      this._fetchInProgress = null;
      // R39-FIX: Use retry wrapper for transient network errors on reconnect
      // R41-FIX: Show error feedback if fetch fails after all retries —
      // without this the user sees "You are online" but stale/empty data.
      // R50-FIX (M1): Record last successful fetch timestamp so the socket
      // connect handler can skip redundant fetches within 5 seconds.
      this._lastFetchTime = Date.now();
      this.fetchKOTWithRetry().then(() => {
        if (!this._isMounted) return;
        // R43-FIX: Removed redundant masonryLoading() — fetchKOT() already calls
        // masonryLoading(true) on success.
      }).catch((e) => {
        if (import.meta.env?.DEV) console.error("KOT fetch failed:", e);
        if (this._isMounted) {
          this.setStatusMessage("Back online but data refresh failed. Click Refresh.");
          this.hideStatusMessageAfterDelay();
        }
      });
    },
    handleOffline() {
      // R37-FIX: Guard against post-unmount execution
      if (!this._isMounted) return;
      this.isOnline = false;
      this.setStatusMessage("You are Offline");
    },
    setStatusMessage(message) {
      this.statusMessage = message;
    },
    hideStatusMessageAfterDelay() {
      if (this._statusTimeout) clearTimeout(this._statusTimeout);
      this._statusTimeout = setTimeout(() => {
        // R37-FIX: Guard against mutating unmounted component
        if (!this._isMounted) return;
        this.statusMessage = "";
      }, 3000);
    },
    // R49-FIX: Removed handleTransitionEnd — it was dead code.
    // The @transitionend handler never fired because the status message
    // div has no CSS transition property (no transition-colors class).
    // The R44 intent (clear message on color change) is already handled
    // by hideStatusMessageAfterDelay() which runs after setStatusMessage().
    // Additionally, clearing the message via v-if would remove the element
    // mid-transition, preventing the user from ever seeing the green color.
  },
  created() {
    // R36-FIX: Initialize as non-reactive instance properties (no Proxy overhead)
    this._isMounted = false;
    this._fetchInProgress = null;
    // R47-FIX (H2): Fetch generation counter — incremented before each new fetch
    // triggered by station change or reconnect. Enables stale-result detection
    // so an old fetch's .then() doesn't overwrite a newer fetch's data.
    this._fetchId = 0;
    this.notifiedKots = new Set();
    // R46-FIX (H2): 30-second cooldown after mount before sending delay
    // notifications. notifiedKots is an empty Set on every page refresh,
    // so without this cooldown all KOTs past the alert threshold would
    // trigger orderDelayNotify() simultaneously on mount.
    this._notificationCooldown = true;
    this._notificationCooldownTimer = setTimeout(() => { this._notificationCooldown = false; }, 30000);
    // API client as non-reactive instance property (avoids Proxy overhead)
    this.call = markRaw(frappe.call());
    // R37-FIX: socketHandler as non-reactive to avoid unnecessary Proxy overhead
    // R49-FIX (H2): Initialize socketHandler immediately instead of null —
    // ensures the handler is always available for fetchKOT() to register
    // on the channel, even if the init chain's fetchKOTWithRetry rejects.
    this.socketHandler = (doc) => this._handleSocketEvent(doc);
    // R37-FIX: sortedItems cache map — avoids mutating reactive kot objects in computed
    this._sortedItemsCache = new Map();
    // R39-FIX: masonry as non-reactive instance property — Masonry objects are large
    // and should not be tracked by Vue's reactivity system. Previously in data(),
    // it triggered unnecessary Proxy overhead and could cause cascading re-renders
    // when the masonry reference changed during reloadItems/layout calls.
    this._masonry = null;
    // R39-FIX: Track socket init retry timer for cleanup
    this._socketRetryTimer = null;
    // R40-FIX: Debounced masonry layout for socket events — prevents layout
    // thrashing when multiple socket events arrive in rapid succession.
    this._debouncedMasonryLayout = debounce(() => { this.masonryLoading(); }, 100);
    // R40-FIX: Recursion guard for errorCaptured
    this._errorCapturedRecovering = false;
    // R41-FIX: In-flight operation set for serveOrder/confirmOrder dedup
    this._inflightOps = new Set();
    // R42-FIX: Generation counter for fetchKOTWithRetry — prevents orphaned
    // promise chains when concurrent calls cancel each other's retry timers.
    this._fetchGeneration = 0;
    // R45-FIX: Initialize _cancelTimeout for consistency with other cleanup
    // properties — previously relied on falsy undefined check in serveOrder/confirmOrder.
    this._cancelTimeout = null;
    // R48-FIX (M1): AbortController reference for cancelling in-flight fetches
    this._fetchAbortController = null;
    // R48-FIX (M3): Store previously focused element to restore on modal close
    this._preModalFocus = null;
  },
  mounted() {
    this._isMounted = true;
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
    document.addEventListener("click", this.hideAudioAlertMessage);
    // R36-FIX: Use route params instead of fragile URL parsing
    const production = this.$route?.params?.production || '';
    // R42-FIX: decodeURIComponent can throw URIError on malformed input
    // (e.g., '%E0%A4%E' — incomplete UTF-8 sequence). Wrap in try-catch
    // to prevent the entire component from failing to mount.
    let decodedProduction;
    try {
      decodedProduction = decodeURIComponent(production);
    } catch (e) {
      if (import.meta.env?.DEV) console.warn('Failed to decode production param:', production, e);
      decodedProduction = production; // Use raw value as fallback
    }
    this.production = decodedProduction;

    const debouncedMasonry = debounce(() => { this.masonryLoading(); }, 150);
    this._resizeHandler = debouncedMasonry;
    window.addEventListener("resize", this._resizeHandler);
    this.masonryLoading();

    // R39-FIX: Handle bfcache restore — when the browser restores this page from
    // back-forward cache, the socket may be stale and timers may not fire.
    // Re-initialize socket and re-fetch KOT data on pageshow with persisted=true.
    this._pageshowHandler = (event) => {
      if (event.persisted) {
        // Page was restored from bfcache — re-fetch data and re-init socket
        // R39-FIX: Use retry wrapper for bfcache restore re-fetch
        this.fetchKOTWithRetry().catch(() => {});
        if (this._socket && !this._socket.connected) {
          this._socket.connect();
        }
      }
    };
    window.addEventListener('pageshow', this._pageshowHandler);

    // R39-FIX: Socket init with retry — if fetchSiteName fails (network issue,
    // server down), retry with exponential backoff instead of giving up forever.
    // Without this, a transient site-name fetch failure would leave the KDS
    // without real-time updates until a full page reload.
    // R49-FIX: Create AbortController for socket init chain so fetchSiteName
    // can be cancelled on component unmount, releasing network resources.
    this._socketAbortController = new AbortController();
    const socketSignal = this._socketAbortController.signal;
    const initSocketWithRetry = (retries = 0) => {
      return initializeSocket(socketSignal).then(sock => {
        if (sock) return sock;
        // initializeSocket returned null (siteName fetch failed) — retry
        const delay = Math.min(2000 * Math.pow(2, retries), 30000);
        if (!this._isMounted) return null;
        return new Promise(resolve => {
          this._socketRetryTimer = setTimeout(() => {
            if (!this._isMounted) { resolve(null); return; }
            resolve(initSocketWithRetry(retries + 1));
          }, delay);
        });
      });
    };
    // R40-FIX: Run socket init and auth in parallel, but store the socket
    // in this._socket as soon as it resolves — even before auth completes.
    // Previously, Promise.all meant the socket was only stored after BOTH
    // socket init AND auth succeeded. If auth() rejected, the socket was
    // orphaned (never stored in this._socket) and thus never disconnected
    // in beforeUnmount, causing a connection leak.
    const authPromise = this.auth();
    this._socketInitPromise = initSocketWithRetry();

    // R44-FIX: Start data fetch as soon as auth succeeds, independently of socket
    // init. Previously, data only loaded after BOTH socket AND auth completed,
    // causing a blank KDS when socket init was slow (siteName fetch + WebSocket
    // handshake can take 2-5s). Now the early fetch shows data immediately, and
    // the socket chain's fetchKOTWithRetry is skipped if data is already loaded.
    authPromise.then(() => {
      if (!this._isMounted) return;
      this.fetchKOTWithRetry().catch(() => {});
    }).catch(() => {});

    this._socketInitPromise
      .then((sock) => {
        // R40-FIX: If component unmounted during socket init, disconnect immediately
        if (!this._isMounted) {
          if (sock) sock.disconnect();
          return null;
        }
        // R40-FIX: Store socket early so beforeUnmount can always clean it up
        this._socket = sock;
        // Now wait for auth to complete
        return authPromise;
      })
      .then(() => {
        if (!this._isMounted || !this._socket) return;
        this._socket.on('connect_error', (err) => {
          if (!this._isMounted) return;
          // R49-FIX: Escalate message after prolonged disconnection
          if (!this._disconnectedSince) this._disconnectedSince = Date.now();
          const elapsed = Date.now() - this._disconnectedSince;
          const msg = elapsed > 300000
            ? "Offline for 5+ minutes. Check network connection."
            : "Connection error. Retrying...";
          if (this.statusMessage !== msg) {
            if (import.meta.env?.DEV) console.error("Socket connection error:", err);
            this.setStatusMessage(msg);
          }
        });
        this._socket.on('disconnect', (reason) => {
          if (!this._isMounted) return;
          if (import.meta.env?.DEV) console.warn("Socket disconnected:", reason);
          // R42-FIX: Skip reactive assignment if message is already showing
          // the same text — avoids unnecessary Vue re-renders during flapping.
          if (this.statusMessage !== "Connection lost. Reconnecting...") {
            this.setStatusMessage("Connection lost. Reconnecting...");
          }
        });
        this._socket.on('connect', () => {
          if (!this._isMounted) return;
          this._disconnectedSince = null;
          // R50-FIX: Abort in-flight fetch and invalidate to prevent stale data after server restart
          if (this._fetchAbortController) {
            this._fetchAbortController.abort();
            this._fetchAbortController = null;
          }
          this._fetchId++;
          this._fetchInProgress = null;
          this.setStatusMessage("Reconnected");
          this.hideStatusMessageAfterDelay();
          // R38-FIX: Re-fetch KOT data after reconnect to sync any missed updates
          // during disconnection period. Without this, the UI could show stale KOTs.
          // R39-FIX: Use retry wrapper for transient errors on reconnect
          // R43-FIX: Remove redundant .then(() => masonryLoading()) — fetchKOT()
          // already calls masonryLoading(true) on success.
          // R45-FIX: Handle fetch failure — previously .catch(() => {}) silently
          // swallowed errors. During extended outages, the user's session may have
          // expired, so auth errors need to show the login modal. Other errors
          // show a status message so the user knows data refresh failed.
          // R50-FIX (M1): Skip fetch if handleOnline already fetched successfully
          // within the last 5 seconds. Both handleOnline and this connect handler
          // trigger fetchKOTWithRetry on reconnect — without this guard, the second
          // fetch wastes bandwidth and causes a brief UI flicker.
          const timeSinceLastFetch = Date.now() - (this._lastFetchTime || 0);
          if (timeSinceLastFetch < 5000) {
            if (import.meta.env?.DEV) console.log('Skipping socket connect fetch — recent fetch exists');
          } else {
            this.fetchKOTWithRetry().catch((error) => {
              this._handleFetchError(error, "Reconnected but data refresh failed. Click Refresh.");
            });
          }
        });

        // R39-FIX: Use retry wrapper for initial fetch — transient server errors
        // should not leave the KDS permanently blank.
        // R44-FIX: Skip if early fetch (started after auth) already loaded data.
        // This avoids a redundant full refresh when the early fetch succeeded.
        if (this.kot.length === 0) {
          return this.fetchKOTWithRetry();
        }
      })
      .then(() => {
        if (!this._isMounted || !this._socket) return;
        if (Number(this.audio_alert) === 1) {
          this.showAudioAlertMessage = true;
        }
        // R49-FIX (H2): socketHandler is now defined in created() via
        // _handleSocketEvent, so we only need to register it on the
        // channel here. Previously, the handler was defined inline, which
        // meant it was never created if the init chain's fetchKOTWithRetry
        // rejected — leaving socketHandler permanently null and the KDS
        // without real-time updates until a full page refresh.
        if (this._socket && this.socketHandler && this.kot_channel) {
          this._socket.on(this.kot_channel, this.socketHandler);
        }
      })
      .catch((error) => {
        if (import.meta.env?.DEV) console.error("Initialization or authentication error:", error);
        // R40-FIX: this._socket is now stored early, so beforeUnmount will
        // disconnect it. No need for manual cleanup here.
        if (this._isMounted) {
          // R41-FIX: Differentiate auth errors from network/server errors.
          // Auth failure → "Not Permitted" with login prompt.
          // Network/server failure → "Connection Error" with retry guidance.
          // R45-FIX: Use centralized _isAuthError instead of duplicated inline check
          if (this._isAuthError(error)) {
            this.modalTitle = "Not Permitted";
            this.modalMessage = "Log in to access this page.";
          } else {
            this.modalTitle = "Connection Error";
            this.modalMessage = "Unable to reach the server. Please check your connection and try again.";
          }
          this.showModal = true;
        }
      });
    // R49-FIX: Use _timer prefix for naming consistency with other
    // non-reactive instance properties (_masonry, _socket, _fetchInProgress, etc.)
    this._timer = setInterval(this.updateTimeRemaining, 60000);
    // R50-FIX (L2): Pause timer when tab is hidden to avoid unnecessary work
    this._visibilityHandler = () => {
      if (document.hidden) {
        if (this._timer) { clearInterval(this._timer); this._timer = null; }
      } else {
        if (!this._timer) {
          this._timer = setInterval(this.updateTimeRemaining, 60000);
          this.updateTimeRemaining();
        }
      }
    };
    document.addEventListener('visibilitychange', this._visibilityHandler);
  },
  beforeUnmount() {
    this._isMounted = false;
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    document.removeEventListener("click", this.hideAudioAlertMessage);
    window.removeEventListener("resize", this._resizeHandler);
    if (this._pageshowHandler) window.removeEventListener('pageshow', this._pageshowHandler);
    // R50-FIX (L2): Clean up visibilitychange listener
    if (this._visibilityHandler) {
      document.removeEventListener('visibilitychange', this._visibilityHandler);
      this._visibilityHandler = null;
    }
    if (this.socketHandler && this._socket) {
      this._socket.off(this.kot_channel, this.socketHandler);
    }
    if (this._socket) {
      this._socket.off('connect_error');
      this._socket.off('disconnect');
      this._socket.off('connect');
      this._socket.disconnect();
    }
    this._socketInitPromise = null;
    if (this._cancelTimeout) clearTimeout(this._cancelTimeout);
    if (this._statusTimeout) clearTimeout(this._statusTimeout);
    if (this._socketRetryTimer) clearTimeout(this._socketRetryTimer);
    if (this._fetchRetryTimer) clearTimeout(this._fetchRetryTimer);
    if (this._notificationCooldownTimer) clearTimeout(this._notificationCooldownTimer);
    // R48-FIX (M1): Abort any in-flight fetch on unmount
    if (this._fetchAbortController) {
      this._fetchAbortController.abort();
      this._fetchAbortController = null;
    }
    // R49-FIX: Abort socket init fetch on unmount
    if (this._socketAbortController) {
      this._socketAbortController.abort();
      this._socketAbortController = null;
    }
    // R50-FIX (H2): Abort any in-flight confirm/serve request on unmount
    if (this._mutateAbortController) {
      this._mutateAbortController.abort();
      this._mutateAbortController = null;
    }
    // R47-FIX (M4): Restore body scroll in case modal was open at unmount time
    document.body.style.overflow = '';
    // R41-FIX: Cancel pending debounced masonry calls on unmount.
    // Without this, a debounced masonryLayout could fire after unmount,
    // attempting DOM operations on a detached element tree.
    if (this._debouncedMasonryLayout) this._debouncedMasonryLayout.cancel();
    if (this._resizeHandler) this._resizeHandler.cancel?.();
    if (this._timer) clearInterval(this._timer);
    // R42-FIX: Clear src and call load() after pause() to release the audio
    // resource. Without this, some browsers keep the network connection open
    // even after pause(), leaking the audio file's network resources.
    if (this._alertAudio) {
      this._alertAudio.pause();
      this._alertAudio.src = '';
      this._alertAudio.load();
      this._alertAudio = null;
    }
    // R39-FIX: Destroy non-reactive masonry instance on unmount
    if (this._masonry) {
      this._masonry.destroy();
      this._masonry = null;
    }
  },
  computed: {
    // R39-FIX: sortedKotItems moved from computed (which returned a function) to
    // a method. Previously, the computed returned a new function object every time
    // its reactive dependencies (this.kot) changed, which happened every minute
    // via updateTimeRemaining. Each new function object was unnecessary churn.
    // As a method, the function identity is stable and the manual _sortedItemsCache
    // still provides memoization. The template call `sortedKotItems(kot)` works
    // identically for both computed-returning-function and method.
    visibleKots() {
      // R39-FIX: Removed !kot.showDiv filter — showDiv was always false (dead code).
      // When production is empty (root route "/"), show ALL KOTs instead of filtering
      // by empty string which would exclude KOTs that have a station assigned.
      if (!this.production) {
        return this.kot;
      }
      return this.kot.filter(kot => kot.production === this.production);
    },
  },
  watch: {
    // R47-FIX (M4): Prevent background scrolling when auth modal is open
    // R48-FIX (M2): Auto-focus first focusable element when modal opens.
    // R48-FIX (M3): Return focus to previously active element on close.
    showModal(val) {
      document.body.style.overflow = val ? 'hidden' : '';
      if (val) {
        // R48-FIX (M3): Capture the element that had focus before modal opened
        this._preModalFocus = document.activeElement;
        // R48-FIX (M2): Auto-focus the modal or first focusable child
        this.$nextTick(() => {
          const modal = this.$refs.authModal;
          if (modal) {
            const first = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            (first || modal).focus();
          }
        });
      } else {
        // R48-FIX (M3): Restore focus to the element that was active before modal opened
        if (this._preModalFocus && typeof this._preModalFocus.focus === 'function' && document.contains(this._preModalFocus)) {
          this.$nextTick(() => {
            if (this._preModalFocus) this._preModalFocus.focus();
            this._preModalFocus = null;
          });
        }
      }
    },
    // R41-FIX: Vue reuses component instances when navigating between routes
    // that use the same component (Home). Without this watcher, navigating
    // from /station/kitchen to /station/bar would NOT re-mount the KOT
    // component, so this.production would still be "kitchen" and the KDS
    // would filter for the wrong station.
    '$route.params.production'(newVal) {
      // R42-FIX: decodeURIComponent can throw URIError on malformed input
      let decoded;
      try {
        decoded = decodeURIComponent(newVal || '');
      } catch (e) {
        if (import.meta.env?.DEV) console.warn('Failed to decode production param:', newVal, e);
        decoded = newVal || '';
      }
      if (decoded === this.production) return;
      this.production = decoded;
      // Re-register socket handler on the new channel
      if (this.kot_channel && this._socket && this.socketHandler) {
        this._socket.off(this.kot_channel, this.socketHandler);
      }
      // R48-FIX (M1): Abort any in-flight fetch for the old station before switching.
      if (this._fetchAbortController) {
        this._fetchAbortController.abort();
        this._fetchAbortController = null;
      }
      // R46-FIX (H1): Invalidate stale fetch promise so a fresh one is created
      // for the new station. Without this, fetchKOT() returns the in-flight
      // promise for the OLD station, resulting in wrong data + wrong socket channel.
      // R47-FIX (H2): Increment fetch generation so the old fetch's .then() discards results
      this._fetchId++;
      this._fetchInProgress = null;
      // fetchKOT will set the new kot_channel and re-register the handler
      // R45-FIX: Handle fetch failure on station change — previously .catch(() => {})
      // silently swallowed errors, leaving the user with an empty KDS and no feedback.
      this.fetchKOTWithRetry().catch((error) => {
        this._handleFetchError(error, "Failed to load station data. Click Refresh.");
      });
    },
  },
};
</script>
<style scoped>
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
