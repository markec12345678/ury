<template>
  <div>
    <Header @refresh="handleRefresh" />
    <KOT ref="kotRef" />
  </div>
</template>

<script>
import KOT from "../components/kot.vue";
import Header from "../components/Header.vue";

export default {
  name: "Home",
  components: {
    KOT,
    Header,
  },
  methods: {
    handleRefresh() {
      // R39-FIX: Use fetchKOTWithRetry for manual refresh — gives the user
      // automatic retries instead of silently failing on transient errors.
      // R40-FIX: Show status message on failure instead of swallowing silently.
      if (this.$refs.kotRef && typeof this.$refs.kotRef.fetchKOTWithRetry === 'function') {
        this.$refs.kotRef.fetchKOTWithRetry().catch(() => {
          if (this.$refs.kotRef && typeof this.$refs.kotRef.setStatusMessage === 'function') {
            this.$refs.kotRef.setStatusMessage("Refresh failed. Please try again.");
            if (typeof this.$refs.kotRef.hideStatusMessageAfterDelay === 'function') {
              this.$refs.kotRef.hideStatusMessageAfterDelay();
            }
          }
        });
      }
    },
  },
};
</script>