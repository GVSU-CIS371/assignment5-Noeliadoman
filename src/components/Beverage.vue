<template>
  <Mug>
    <Cold v-if="isIced" />
    <Hot v-else />
    <Contents>
      <template v-slot:top>
        <Creamer v-if="showCreamer" />
      </template>
      <template v-slot:mid>
        <Syrup v-if="showSyrup" />
      </template>
      <template v-slot:bottom>
        <Base />
      </template>
    </Contents>
  </Mug>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Contents from "./Contents.vue";
import Mug from "./Mug.vue";
import Syrup from "./Syrup.vue";
import Base from "./Base.vue";
import Creamer from "./Creamer.vue";
import Hot from "./Hot.vue";
import Cold from "./Cold.vue";
import { useBeverageStore } from "../stores/beverageStore";

type Props = { isIced: boolean };
defineProps<Props>();

const store = useBeverageStore();
const showCreamer = computed(() => store.currentCreamer.name !== "No Cream");
const showSyrup   = computed(() => store.currentSyrup.name   !== "No Syrup");
</script>
