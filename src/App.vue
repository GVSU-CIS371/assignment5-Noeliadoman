<template>
  <div>
    <Beverage :isIced="beverageStore.currentTemp === 'Cold'" />

    <ul>
      <!-- Temperature -->
      <li>
        <template v-for="temp in beverageStore.temps" :key="temp">
          <label>
            <input
              type="radio"
              name="temperature"
              :id="`r${temp}`"
              :value="temp"
              v-model="beverageStore.currentTemp"
            />
            {{ temp }}
          </label>
        </template>
      </li>

      <!-- Base Beverage -->
      <li>
        <template v-for="base in beverageStore.allBases" :key="base.id">
          <label>
            <input
              type="radio"
              name="base"
              :value="base"
              v-model="beverageStore.currentBase"
            />
            {{ base.name }}
          </label>
        </template>
      </li>

      <!-- Syrup -->
      <li>
        <template v-for="syrup in beverageStore.allSyrups" :key="syrup.id">
          <label>
            <input
              type="radio"
              name="syrup"
              :value="syrup"
              v-model="beverageStore.currentSyrup"
            />
            {{ syrup.name }}
          </label>
        </template>
      </li>

      <!-- Creamer -->
      <li>
        <template v-for="creamer in beverageStore.allCreamers" :key="creamer.id">
          <label>
            <input
              type="radio"
              name="creamer"
              :value="creamer"
              v-model="beverageStore.currentCreamer"
            />
            {{ creamer.name }}
          </label>
        </template>
      </li>

      <!-- Name + Make Beverage -->
      <li>
        <input
          type="text"
          placeholder="Beverage Name"
          v-model="beverageStore.beverageName"
          @keyup.enter="beverageStore.makeBeverage()"
        />
        <button @click="beverageStore.makeBeverage()">🍺 Make Beverage</button>
      </li>
    </ul>
  </div>

  <!-- Saved Beverages -->
  <div id="beverage-container" style="margin-top: 20px">
    <template v-if="beverageStore.savedBeverages.length > 0">
      <p class="saved-label">Saved Beverages:</p>
      <div class="saved-list">
        <label
          v-for="recipe in beverageStore.savedBeverages"
          :key="recipe.id"
          class="saved-item"
        >
          <input
            type="radio"
            name="savedBeverage"
            :value="recipe"
            @change="beverageStore.showBeverage(recipe)"
          />
          {{ recipe.name }}
        </label>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";
const beverageStore = useBeverageStore();
</script>

<style lang="scss">
body,
html {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #6e4228;
  background: linear-gradient(to bottom, #6e4228 0%, #956f5a 100%);
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: white;
}
label {
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 8px;
}
input[type="text"] {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
button {
  padding: 4px 12px;
  border-radius: 4px;
  border: none;
  background: #c8a96e;
  cursor: pointer;
  font-weight: bold;
}
button:hover {
  background: #e0c080;
}
.saved-label {
  color: white;
  font-weight: bold;
  margin-bottom: 6px;
}
.saved-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.saved-item {
  color: white;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 12px;
  border-radius: 20px;
  cursor: pointer;
}
.saved-item:hover {
  background: rgba(255, 255, 255, 0.28);
}
</style>
