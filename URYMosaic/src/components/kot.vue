<template>
  <div class="mx-auto p-6 mb-16 relative">
    <!-- Alert Modal div start-->
    <div
      v-if="showModal"
      class="fixed inset-0 z-[60] overflow-y-auto modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-center">
        <div class="w-full rounded-lg bg-white p-6 shadow-lg md:max-w-md">
          <p
            class="block text-left text-xl font-medium text-gray-700 dark:text-gray-300"
          >
            <span
              class="w-3 h-3 rounded-full inline-block mr-1 bg-red-500"
            ></span>
            Not Permitted
          </p>
          <hr class="border-gray-200" />

          <p class="text-left text-xl mt-6 font-medium text-gray-500">
            Log in to access this page.
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
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div v-for="kot in visibleKots" :key="kot.name">
        <div
          :class="[kot.color]"
          class="inline-block shadow-lg gap-4 p-3 rounded-2xl w-80 h-auto masonry-item"
          style="margin-top: 28px"
          role="button"
          tabindex="0"
          :aria-label="`${kot.tableortakeaway}, Order ${kot.order_no || (kot.invoice ? String(kot.invoice).slice(-4) : '—')}, ${kot.timeRemaining} elapsed`"
          @keydown.enter="rotateCard(kot)"
          @keydown.space.prevent="rotateCard(kot)"
        >
          <div class="w-64">
            <div
              :class="[{ hidden: !kot.isRotated }]"
              @click="rotateCard(kot)"
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
              <div class="flex justify-between" @click="rotateCard(kot)">
                <div class="text-sm w-48">
                  <span
                    v-if="kot.tableortakeaway !== 'Takeaway'"
                    class="text-sm font-medium text-[#6B7280]"
                    >Table
                  </span>
                  <span class="text-gray-900 font-semibold">
                    {{ kot.tableortakeaway }}
                    <span class="text-sm font-medium text-[#6B7280]"
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
                    >{{ daily_order_number ? kot.order_no : (kot.invoice ? String(kot.invoice).slice(-4) : '—') }}
                    
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
                    @click="
                      () => {
                        toggleItemStrikeThrough(kotitem, kot);
                      }
                    "
                    :class="{
                      'line-through text-green-700': kotitem.striked,
                    }"
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
      @transitionend="handleTransitionEnd"
    >
      {{ statusMessage }}
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

function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// R37-FIX: fetchAndSetSiteName now returns siteName instead of mutating module-level state
async function fetchSiteName() {
    try {
        const response = await fetch('/api/method/ury.ury.api.ury_kot_display.get_site_name', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return data?.message?.site_name || '';
    } catch (error) {
        if (import.meta.env?.DEV) console.error('Failed to fetch site name:', error);
        return '';
    }
}

async function initializeSocket() {
    // R37-FIX: Use local variable instead of module-level shared state
    const siteName = await fetchSiteName();
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
        console.error('Site name is not set. Socket cannot be initialized.');
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
      loggeduser: "",
      showModal: false,
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
    console.error('KDS rendering error:', err, info);
    if (!this._errorCapturedRecovering) {
      this._errorCapturedRecovering = true;
      this.setStatusMessage('Display error — refreshing...');
      this.hideStatusMessageAfterDelay();
      // Attempt recovery by re-fetching KOT data (with retry for transient errors)
      this.fetchKOTWithRetry().then(() => { this.masonryLoading(); }).catch(() => {}).finally(() => {
        this._errorCapturedRecovering = false;
      });
    }
    // Return false to prevent the error from propagating further up
    return false;
  },
  methods: {
    playAlertSound(path) {
      if (!path) return; // R37-FIX: Guard against null/undefined audio path
      const currentDomain = window.location.origin;
      const audio_path = currentDomain + path;
      // R36-FIX: Use instance-level audio to avoid cross-instance conflicts
      if (!this._alertAudio) {
        this._alertAudio = new Audio(audio_path);
      } else {
        this._alertAudio.src = audio_path;
      }
      this._alertAudio.play().catch(() => {
        // R36-FIX: Show UI fallback when audio fails — kitchen staff need to know
        if (!this._isMounted) return; // R37-FIX: Guard against post-unmount
        this.showAudioAlertMessage = true;
      });
    },
    // R40-FIX: Removed unnecessary new Promise() wrapper — frappe.auth().getLoggedInUser()
    // already returns a Promise. The old pattern was an anti-pattern that added nesting
    // and lost stack traces on rejection.
    auth() {
      return frappe.auth().getLoggedInUser()
        .then((user) => {
          this.loggeduser = user;
          // Update shared auth state so route guard works
          if (this.authState) {
            this.authState.isLoggedIn = true;
          }
        })
        .catch((error) => {
          if (import.meta.env?.DEV) console.error(error);
          throw error; // Re-throw so callers can catch
        });
    },
    fetchKOT() {
      // Deduplicate concurrent fetchKOT calls to prevent state corruption
      if (this._fetchInProgress) return this._fetchInProgress;
      this._fetchInProgress = new Promise((resolve, reject) => {
        try {
          this.call
            .get("ury.ury.api.ury_kot_display.kot_list", {})
            .then((result) => {
              if (!this._isMounted) { resolve(); return; }
              // R37-FIX: Null-check result.message to prevent TypeError crash
              const msg = result?.message;
              if (!msg) { resolve(); return; }
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
              this.kot = (msg.KOT || []).map(k => ({
                isRotated: false, timecolor: 'text-black', timeRemaining: '— : —', ...k
              }));
              this.updateQtyColorTable();
              this.updateTimeRemaining();
              this.masonryLoading(true);
              resolve();
            })
            .catch((error) => {
              if (import.meta.env?.DEV) console.error(error);
              reject(error);
            });
        } catch (error) {
          reject(error);
        }
      }).finally(() => {
        this._fetchInProgress = null;
      });
      return this._fetchInProgress;
    },
    rotateCard(kot) {
      // R39-FIX: Removed masonryLoading() call — the card overlay is
      // position:absolute and doesn't change the card's dimensions, so
      // a full masonry re-layout is unnecessary and caused layout thrashing
      // on every card click.
      kot.isRotated = !kot.isRotated;
    },
    confirmOrder(kot) {
      // R40-FIX: Clear pending cancel timeout — the user has already confirmed,
      // so the scheduled re-fetch would be redundant and wasteful.
      if (this._cancelTimeout) { clearTimeout(this._cancelTimeout); this._cancelTimeout = null; }
      this.call
        .post("ury.ury.api.ury_kot_display.confirm_cancel_kot", {
          name: kot.name,
        })
        .then((result) => {
          if (!this._isMounted) return;
          const idx = this.kot.findIndex(k => k.name === kot.name);
          if (idx !== -1) this.kot.splice(idx, 1);
          this.removeAllItemsFromLocalStorage(kot);
          // R37-FIX: Clean up notifiedKots entry and sorted cache for removed KOT
          this.notifiedKots.delete(kot.name);
          this._sortedItemsCache.delete(kot.name);
          this.masonryLoading();
        })
        .catch((error) => {
          this.setStatusMessage("Action failed. Please try again.");
          this.hideStatusMessageAfterDelay();
        });
    },
    serveOrder(kot) {
      // R40-FIX: Clear pending cancel timeout — the user has already served,
      // so the scheduled re-fetch would be redundant and wasteful.
      if (this._cancelTimeout) { clearTimeout(this._cancelTimeout); this._cancelTimeout = null; }
      this.call
        .post("ury.ury.api.ury_kot_display.serve_kot", {
          name: kot.name,
        })
        .then((result) => {
          if (!this._isMounted) return;
          const idx = this.kot.findIndex(k => k.name === kot.name);
          if (idx !== -1) this.kot.splice(idx, 1);
          this.removeAllItemsFromLocalStorage(kot);
          // R37-FIX: Clean up notifiedKots entry and sorted cache for removed KOT
          this.notifiedKots.delete(kot.name);
          this._sortedItemsCache.delete(kot.name);
          this.masonryLoading();
        })
        .catch(() => {
          this.setStatusMessage("Action failed. Please try again.");
          this.hideStatusMessageAfterDelay();
        });
    },

    orderDelayNotify(kot) {

      this.call
        .post(
          "ury.ury.api.ury_kot_notification.order_delay_notification",
          {
            id: kot.name,
          }
        )
        .catch((error) => { if (import.meta.env?.DEV) console.error(error); });
    },
    toggleItemStrikeThrough(kotitem, kot) {
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
        if (table_takeaway === 1) {
          kot.tableortakeaway = "Takeaway";
        } else {
          kot.tableortakeaway = restaurant_table;
        }
      }
      if (type === "Order Modified") {
        kot.color = "bg-[#FFD493] border border-[#FFC700]";
      } else if (type === "Partially cancelled" || type === "Cancelled") {
        kot.color = "bg-[#FFD2D2] border border-[#FAA7A7]";
      } else if (restaurant_table === undefined || table_takeaway === 1) {
        kot.color = "bg-blue-100 border border-blue-200";
      } else {
        kot.color = "bg-white";
      }
    },
    updateQtyColorTable() {
      // R38-FIX: Batch-read localStorage once instead of per-item getItem calls.
      // Build a map of strike states keyed by "kotName_kotItemName_strike" in a
      // single pass, then look up from the map. This replaces N individual
      // localStorage.getItem() calls with one iteration + O(1) map lookups.
      const strikeMap = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.endsWith('_strike')) {
            strikeMap[key] = localStorage.getItem(key);
          }
        }
      } catch (e) {
        if (import.meta.env?.DEV) console.error('localStorage read failed:', e);
      }

      this.kot.forEach((kot) => {
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
          const savedState = strikeMap[key];
          if (savedState !== undefined) {
            try {
              kotitem.striked = JSON.parse(savedState);
            } catch (e) {
              kotitem.striked = false;
            }
          }
          this.calculateQty(
            kotitem,
            kotitem.quantity,
            kot.type,
            kotitem.cancelled_qty
          );
        });
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
      this.kot.forEach((kot) => {
        kot.timeRemaining = this.calculateTimeRemaining(kot.time);

        const timeRemaining = kot.timeRemaining.split(":");
        const minutes =
          parseInt(timeRemaining[0], 10) * 60 + parseInt(timeRemaining[1], 10);

        // R36-FIX: Handle NaN from invalid time format — treat as elapsed time exceeded
        const validMinutes = isNaN(minutes) ? Infinity : minutes;

        if (
          validMinutes === Number(this.kot_alert_time) &&
          kot.type !== "Cancelled" &&
          kot.type !== "Partially cancelled" &&
          !this.notifiedKots.has(kot.name)
        ) {
          this.notifiedKots.add(kot.name);
          this.orderDelayNotify(kot);
        }
        // R38-FIX: Guard against empty/falsy kot_alert_time. An empty string
        // coerces to 0 in >= comparison, making ALL KOTs show red time.
        const alertThreshold = Number(this.kot_alert_time);
        if (alertThreshold > 0 && validMinutes >= alertThreshold) {
          kot.timecolor = "text-[#DC0000]";
        } else {
          kot.timecolor = "text-black";
        }
      });
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
      const attempt = (retriesLeft, delay) => {
        return this.fetchKOT().catch(err => {
          if (retriesLeft <= 0 || !this._isMounted) throw err;
          if (import.meta.env?.DEV) console.warn(`fetchKOT failed, retrying in ${delay}ms...`, err);
          return new Promise((resolve, reject) => {
            this._fetchRetryTimer = setTimeout(() => {
              if (!this._isMounted) { reject(err); return; }
              attempt(retriesLeft - 1, Math.min(delay * 2, 30000)).then(resolve).catch(reject);
            }, delay);
          });
        });
      };
      return attempt(maxRetries, initialDelay);
    },
    // R40-FIX: Removed redundant masonryLoading() call — fetchKOT() already
    // calls masonryLoading(true) at the end of its .then() handler, so the
    // extra call here caused a double layout calculation.
    fetchkotwithmasonry() {
      return this.fetchKOTWithRetry()
        .catch((e) => { console.error("KOT fetch failed:", e); });
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
        if (!this.$el) return;
        const grid = this.$el.querySelector(".grid");
        if (!grid) return;
        this._masonry = markRaw(new Masonry(grid, {
          itemSelector: ".masonry-item",
          gutter: 28,
        }));
        this._masonry.layout();
      });
    },
    hideAudioAlertMessage() {
      this.showAudioAlertMessage = false;
    },
    handleOnline() {
      // R37-FIX: Guard against post-unmount execution
      if (!this._isMounted) return;
      this.isOnline = true;
      this.setStatusMessage("You are online");
      this.hideStatusMessageAfterDelay();
      // R39-FIX: Use retry wrapper for transient network errors on reconnect
      this.fetchKOTWithRetry().then(() => {
        if (!this._isMounted) return;
        this.masonryLoading();
      }).catch((e) => { console.error("KOT fetch failed:", e); });
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
    handleTransitionEnd() {
      if (!this.isOnline) {
        // Reset the status message after transition end
        this.setStatusMessage("");
      }
    },
  },
  created() {
    // R36-FIX: Initialize as non-reactive instance properties (no Proxy overhead)
    this._isMounted = false;
    this._fetchInProgress = null;
    this.notifiedKots = new Set();
    // API client as non-reactive instance property (avoids Proxy overhead)
    this.call = markRaw(frappe.call());
    // R37-FIX: socketHandler as non-reactive to avoid unnecessary Proxy overhead
    this.socketHandler = null;
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
  },
  mounted() {
    this._isMounted = true;
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
    document.addEventListener("click", this.hideAudioAlertMessage);
    // R36-FIX: Use route params instead of fragile URL parsing
    const production = this.$route?.params?.production || '';
    const decodedProduction = decodeURIComponent(production);
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
        this.fetchKOTWithRetry().then(() => { this.masonryLoading(); }).catch(() => {});
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
    const initSocketWithRetry = (retries = 0) => {
      return initializeSocket().then(sock => {
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
          console.error("Socket connection error:", err);
          this.setStatusMessage("Connection error. Retrying...");
        });
        this._socket.on('disconnect', (reason) => {
          if (!this._isMounted) return;
          console.warn("Socket disconnected:", reason);
          this.setStatusMessage("Connection lost. Reconnecting...");
        });
        this._socket.on('connect', () => {
          if (!this._isMounted) return;
          this.setStatusMessage("Reconnected");
          this.hideStatusMessageAfterDelay();
          // R38-FIX: Re-fetch KOT data after reconnect to sync any missed updates
          // during disconnection period. Without this, the UI could show stale KOTs.
          // R39-FIX: Use retry wrapper for transient errors on reconnect
          this.fetchKOTWithRetry().then(() => { this.masonryLoading(); }).catch(() => {});
        });

        // R39-FIX: Use retry wrapper for initial fetch — transient server errors
        // should not leave the KDS permanently blank
        return this.fetchKOTWithRetry();
      })
      .then(() => {
        if (!this._isMounted || !this._socket) return;
        if (this.audio_alert === 1) {
          this.showAudioAlertMessage = true;
        }
        this.socketHandler = (doc) => {
          if (!this._isMounted) return;
          // R39-FIX: Guard against null/undefined doc from malformed socket messages
          if (!doc) return;
          try {
            if (this.audio_alert === 1) {
              this.playAlertSound(doc.audio_file);
            }
            // R36-FIX: Namespace localStorage key per production station to avoid cross-tab collision
            // R39-FIX: Normalize null kottime from localStorage — if getItem returns null
            // (no previous value stored) and doc.last_kot_time is also null, they'd be
            // equal and fall through to the incremental path incorrectly. Treat null
            // localStorage value as a signal to do a full refresh.
            let kottime = localStorage.getItem("kot_time_" + this.production);
            if (doc.last_kot_time !== kottime || kottime === null) {
              // Full refresh needed — skip intermediate mutations
              this.fetchKOT().then(() => { this.masonryLoading(); }).catch((e) => { console.error("KOT fetch failed:", e); });
            } else {
              // R36-FIX: Guard against missing doc.kot to prevent TypeError crash
              if (!doc.kot) {
                this.fetchKOT().then(() => { this.masonryLoading(); }).catch((e) => { console.error("KOT fetch failed:", e); });
                return;
              }
              // Incremental update — deduplicate to avoid duplicate cards
              const existingIndex = this.kot.findIndex(k => k.name === doc.kot.name);
              if (existingIndex !== -1) {
                // R36-FIX: Preserve strikethrough state before Object.assign overwrites kot_items
                const strikeMap = new Map(
                  (this.kot[existingIndex].kot_items || []).map(i => [i.name, i.striked])
                );
                Object.assign(this.kot[existingIndex], { timecolor: 'text-black', timeRemaining: '— : —', ...doc.kot });
                // Restore strikethrough state after Object.assign
                if (this.kot[existingIndex].kot_items) {
                  this.kot[existingIndex].kot_items.forEach(i => {
                    if (strikeMap.has(i.name)) i.striked = strikeMap.get(i.name);
                  });
                }
                // R37-FIX: Invalidate sorted cache for this KOT since items may have changed
                this._sortedItemsCache.delete(doc.kot.name);
              } else {
                // R39-FIX: Removed showDiv: false — dead code
                const newKot = { isRotated: false, timecolor: 'text-black', timeRemaining: '— : —', ...doc.kot };
                this.kot.unshift(newKot);
              }
              this.updateQtyColorTable();
              this.updateTimeRemaining();
              // R40-FIX: Use debounced masonry layout for rapid socket events
              this._debouncedMasonryLayout();
            }
            if (this._cancelTimeout) clearTimeout(this._cancelTimeout);
            // R39-FIX: Only schedule cancel re-fetch if the KOT is actually a cancellation.
            // Previously, _cancelTimeout was set for ALL socket events, causing an
            // unnecessary re-fetch 1.5s after every non-cancel update. Now we only
            // set the timeout when doc.kot.type is "Cancelled", matching the check inside.
            if (doc.kot && doc.kot.type === "Cancelled") {
              this._cancelTimeout = setTimeout(() => {
                if (!this._isMounted) return;
                this.fetchKOT().then(() => {
                  this.masonryLoading();
                }).catch((e) => { console.error("KOT fetch failed:", e); });
              }, 1500);
            }
            if (doc.kot) {
              try {
                localStorage.setItem("kot_time_" + this.production, doc.kot.time);
              } catch (e) {
                if (import.meta.env?.DEV) console.error('localStorage write failed:', e);
              }
            }
          } catch (err) {
            if (import.meta.env?.DEV) console.error("Socket handler error:", err);
          }
        };
        if (this._socket) this._socket.on(this.kot_channel, this.socketHandler);
      })
      .catch((error) => {
        console.error("Initialization or authentication error:", error);
        // R40-FIX: this._socket is now stored early, so beforeUnmount will
        // disconnect it. No need for manual cleanup here.
        if (this._isMounted) this.showModal = true;
      });
    this.timer = setInterval(this.updateTimeRemaining, 60000);
  },
  beforeUnmount() {
    this._isMounted = false;
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    document.removeEventListener("click", this.hideAudioAlertMessage);
    window.removeEventListener("resize", this._resizeHandler);
    if (this._pageshowHandler) window.removeEventListener('pageshow', this._pageshowHandler);
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
    if (this.timer) clearInterval(this.timer);
    if (this._alertAudio) { this._alertAudio.pause(); this._alertAudio = null; }
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
};
</script>
<style scoped>
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
