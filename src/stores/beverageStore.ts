import { defineStore } from "pinia";
import { ref } from "vue";
import tempretures from "../data/tempretures.json";
import bases from "../data/bases.json";
import creamers from "../data/creamers.json";
import syrups from "../data/syrups.json";
import type { BaseBeverageType, CreamerType, SyrupType, BeverageType } from "../types/beverage";

export const useBeverageStore = defineStore(
  "BeverageStore",
  () => {

    const temps    = ref<string[]>(tempretures);
    const allBases    = ref<BaseBeverageType[]>(bases);
    const allCreamers = ref<CreamerType[]>(creamers);
    const allSyrups   = ref<SyrupType[]>(syrups);

    const currentTemp    = ref<string>(tempretures[0]);
    const currentBase    = ref<BaseBeverageType>(bases[0]);
    const currentCreamer = ref<CreamerType>(creamers[0]);
    const currentSyrup   = ref<SyrupType>(syrups[0]);

    const beverageName = ref<string>("");

    const savedBeverages = ref<BeverageType[]>([]);

    function makeBeverage() {
      if (!beverageName.value.trim()) return;
      const recipe: BeverageType = {
        id:      crypto.randomUUID(),
        name:    beverageName.value.trim(),
        temp:    currentTemp.value,
        base:    { ...currentBase.value },
        creamer: { ...currentCreamer.value },
        syrup:   { ...currentSyrup.value },
      };
      savedBeverages.value.push(recipe);
      beverageName.value = "";
    }

    function showBeverage(recipe: BeverageType) {
      currentTemp.value    = recipe.temp;
      currentBase.value    = recipe.base;
      currentCreamer.value = recipe.creamer;
      currentSyrup.value   = recipe.syrup;
    }

    return {
      temps,
      allBases,
      allCreamers,
      allSyrups,
      currentTemp,
      currentBase,
      currentCreamer,
      currentSyrup,
      beverageName,
      savedBeverages,
      makeBeverage,
      showBeverage,
    };
  },
  { persist: true }
);
