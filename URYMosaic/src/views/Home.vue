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
      if (this.$refs.kotRef && typeof this.$refs.kotRef.fetchKOTWithRetry === 'function') {
        this.$refs.kotRef.fetchKOTWithRetry().catch(() => {});
      }
    },
  },
};
</script>