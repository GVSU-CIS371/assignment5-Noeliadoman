<template>
  <div class="syrup" :style="syrupStyle"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBeverageStore } from "../stores/beverageStore";
const beverageStore = useBeverageStore();

const syrupStyle = computed(() => {
  const color = beverageStore.currentSyrup.color;
  return {
    background: `repeating-linear-gradient(
      45deg,
      ${color},
      ${color} 10px,
      rgba(225, 207, 149, 1) 10px,
      rgba(225, 207, 149, 1) 20px
    )`,
  };
});
</script>

<style lang="scss" scoped>
.syrup {
  transform: translateY(400%);
  position: relative;
  width: 100%;
  height: 20%;
  animation: pour-tea 2s 1s forwards;
  z-index: 2;
  transition: background 0.5s ease;
}
</style>
