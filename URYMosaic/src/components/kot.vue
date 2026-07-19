<template>
  <div class="mx-auto p-6 mb-16 relative">
    <!-- Alert Modal div start-->
    <div
      v-if="showModal"
      class="fixed inset-0 z-10 overflow-y-auto modal-overlay"
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
      class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div v-for="kot in visibleKots" :key="kot.name">
        <div
          :class="[kot.color]"
          class="inline-block shadow-lg gap-4 p-3 rounded-2xl w-80 h-auto masonry-item"
          style="margin-top: 28px"
          role="button"
          tabindex="0"
          :aria-label="`${kot.tableortakeaway}, Order ${kot.order_no || (kot.invoice ? kot.invoice.slice(-4) : '—')}, ${kot.timeRemaining} elapsed`"
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
                    >{{ daily_order_number ? kot.order_no : (kot.invoice ? kot.invoice.slice(-4) : '—') }}
                    
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
      masonry: null,
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
    auth() {
      return new Promise((resolve, reject) => {
        const authApi = frappe.auth();
        authApi
          .getLoggedInUser()
          .then((user) => {
            this.loggeduser = user;
            // Update shared auth state so route guard works
            if (this.authState) {
              this.authState.isLoggedIn = true;
            }
            resolve();
          })
          .catch((error) => {
            if (import.meta.env?.DEV) console.error(error);
            reject(error);
          });
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
              const newChannel = `kot_update_${this.branch}_${this.production}`;
              // R37-FIX: Re-register socket listener if channel changed (e.g. branch switch)
              if (this.kot_channel && this.kot_channel !== newChannel && this._socket && this.socketHandler) {
                this._socket.off(this.kot_channel, this.socketHandler);
              }
              this.kot_channel = newChannel;
              if (this._socket && this.socketHandler) {
                this._socket.on(this.kot_channel, this.socketHandler);
              }
              // R37-FIX: Invalidate sorted items cache on full refresh
              this._sortedItemsCache.clear();
              this.kot = (msg.KOT || []).map(k => ({
                isRotated: false, showDiv: false, timecolor: 'text-black', timeRemaining: '— : —', ...k
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
      this.masonryLoading();
      kot.isRotated = !kot.isRotated;
    },
    confirmOrder(kot) {
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
          const savedState = localStorage.getItem(
            `${kot.name}_${kotitem.name}_strike`
          );
          if (savedState) {
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
    calculateQty(kotitem, qty, type, cancelled_qty) {
      // R37-FIX: Guard against negative quantities from cancelled_qty > qty
      if (type === "Partially cancelled" || type === "Cancelled") {
        kotitem.qty = Math.max(0, qty - cancelled_qty);
      } else {
        kotitem.qty = qty;
      }
    },
    removeAllItemsFromLocalStorage(kot) {
      // Get all keys in local storage
      const keys = Object.keys(localStorage);
      // Remove keys that start with `${kot.name}_`
      keys.forEach((key) => {
        if (key.startsWith(`${kot.name}_`)) {
          localStorage.removeItem(key);
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
        if (validMinutes >= this.kot_alert_time) {
          kot.timecolor = "text-[#DC0000]";
        } else {
          kot.timecolor = "text-black";
        }
      });
    },
    calculateTimeRemaining(targetTime) {
      if (!targetTime || !targetTime.includes(":")) return '— : —';
      const currentTime = new Date();
      const [targetHours, targetMinutes, targetSeconds] = targetTime.split(":");
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
    fetchkotwithmasonry() {
      return this.fetchKOT().then(() => {
        this.masonryLoading();
      }).catch((e) => { console.error("KOT fetch failed:", e); });
    },
    redirectToLogin() {
      const currentDomain = window.location.origin;
      window.location.href =
        currentDomain + "/login?redirect-to=" + encodeURIComponent("URYMosaic/" + this.production);
    },
    masonryLoading(forceRecreate = false) {
      if (this.masonry && !forceRecreate) {
        this.$nextTick(() => {
          if (this.masonry) {
            this.masonry.reloadItems?.();
            this.masonry.layout();
          }
        });
        return;
      }
      if (this.masonry) {
        this.masonry.destroy();
        this.masonry = null;
      }
      this.$nextTick(() => {
        if (!this.$el) return;
        const grid = this.$el.querySelector(".grid");
        if (!grid) return;
        this.masonry = markRaw(new Masonry(grid, {
          itemSelector: ".masonry-item",
          gutter: 28,
        }));
        this.masonry.layout();
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
      this.fetchKOT().then(() => {
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

    // Initialize socket in mounted() so re-mount gets a fresh connection
    this._socketInitPromise = initializeSocket();

    // Wait for both socket init and auth before attaching listeners
    Promise.all([this._socketInitPromise, this.auth()])
      .then(([sock]) => {
        // R36-FIX: Guard against post-unmount execution
        if (!this._isMounted) return;
        this._socket = sock;
        if (this._socket) this._socket.on('connect_error', (err) => {
          if (!this._isMounted) return;
          console.error("Socket connection error:", err);
          this.setStatusMessage("Connection error. Retrying...");
        });
        if (this._socket) this._socket.on('disconnect', (reason) => {
          if (!this._isMounted) return;
          console.warn("Socket disconnected:", reason);
          this.setStatusMessage("Connection lost. Reconnecting...");
        });
        if (this._socket) this._socket.on('connect', () => {
          if (!this._isMounted) return;
          this.setStatusMessage("Reconnected");
          this.hideStatusMessageAfterDelay();
        });

        return this.fetchKOT();
      })
      .then(() => {
        if (!this._isMounted) return;
        if (this.audio_alert === 1) {
          this.showAudioAlertMessage = true;
        }
        this.socketHandler = (doc) => {
          if (!this._isMounted) return;
          try {
            if (this.audio_alert === 1) {
              this.playAlertSound(doc.audio_file);
            }
            // R36-FIX: Namespace localStorage key per production station to avoid cross-tab collision
            let kottime = localStorage.getItem("kot_time_" + this.production);
            if (doc.last_kot_time !== kottime) {
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
                const newKot = { isRotated: false, showDiv: false, timecolor: 'text-black', timeRemaining: '— : —', ...doc.kot };
                this.kot.unshift(newKot);
              }
              this.updateQtyColorTable();
              this.updateTimeRemaining();
              this.masonryLoading();
            }
            if (this._cancelTimeout) clearTimeout(this._cancelTimeout);
            this._cancelTimeout = setTimeout(() => {
              if (!this._isMounted) return;
              if (doc.kot && doc.kot.type === "Cancelled") {
                this.fetchKOT().then(() => {
                  this.masonryLoading();
                }).catch((e) => { console.error("KOT fetch failed:", e); });
              }
            }, 1500);
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
    if (this.timer) clearInterval(this.timer);
    if (this._alertAudio) { this._alertAudio.pause(); this._alertAudio = null; }
  },
  computed: {
    sortedKotItems() {
      // R37-FIX: Pure computed — no side effects on reactive kot objects.
      // Uses instance-level _sortedItemsCache Map (non-reactive) instead of
      // mutating kot._sortedItems / kot._sortKey which caused reactivity issues
      // and stale cache after Object.assign overwrites kot_items in socket handler.
      return (kot) => {
        const items = kot.kot_items || [];
        const key = `${kot.name}:${items.length}:${items.map(i => i.name).join(',')}`;
        const cached = this._sortedItemsCache.get(kot.name);
        if (cached && cached.key === key) {
          return cached.items;
        }
        const sorted = [...items].sort((a, b) => (a.serve_priority || 0) - (b.serve_priority || 0));
        this._sortedItemsCache.set(kot.name, { key, items: sorted });
        return sorted;
      };
    },
    visibleKots() {
      return this.kot.filter(kot => !kot.showDiv && kot.production === this.production);
    },
  },
};
</script>
<style scoped>
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
