<template>
  <div>
    <Beverage :isIced="beverageStore.currentTemp === 'Cold'" />
    <ul>
      <li>
        <template v-for="temp in beverageStore.temps" :key="temp">
          <label>
            <input
              type="radio"
              name="temperature"
              :id="`r${temp}`"
              :value="temp"
              v-model="beverageStore.currentTemp"
              @change="beverageStore.currentBeverage = null"
            />
            {{ temp }}
          </label>
        </template>
      </li>

      <li>
        <template v-for="base in beverageStore.bases" :key="base.id">
          <label>
            <input
              type="radio"
              name="base"
              :id="`r${base.id}`"
              :value="base"
              v-model="beverageStore.currentBase"
              @change="beverageStore.currentBeverage = null"
            />
            {{ base.name }}
          </label>
        </template>
      </li>

      <li>
        <template v-for="syrup in beverageStore.syrups" :key="syrup.id">
          <label>
            <input
              type="radio"
              name="syrup"
              :id="`r${syrup.id}`"
              :value="syrup"
              v-model="beverageStore.currentSyrup"
              @change="beverageStore.currentBeverage = null"
            />
            {{ syrup.name }}
          </label>
        </template>
      </li>

      <li>
        <template v-for="creamer in beverageStore.creamers" :key="creamer.id">
          <label>
            <input
              type="radio"
              name="creamer"
              :id="`r${creamer.id}`"
              :value="creamer"
              v-model="beverageStore.currentCreamer"
              @change="beverageStore.currentBeverage = null"
            />
            {{ creamer.name }}
          </label>
        </template>
      </li>

      <li>
        <div v-if="beverageStore.user">
          <span>Signed in as {{ beverageStore.user.displayName || beverageStore.user.email }}</span>
          <button @click="beverageStore.signOut()">Sign Out</button>
        </div>
        <div v-else>
          <button @click="beverageStore.withGoogle()">Sign In with Google</button>
        </div>
      </li>

      <li>
        <input type="text" v-model="beverageStore.currentName" placeholder="Beverage Name" />
        <button
          @click="beverageStore.makeBeverage()"
          :disabled="!beverageStore.user"
        >
          🍺 Make Beverage
        </button>
        <p v-if="!beverageStore.user">Please sign in to save your beverage.</p>
        <p v-if="beverageStore.flashMessage">{{ beverageStore.flashMessage }}</p>
        <p v-if="beverageStore.message">{{ beverageStore.message }}</p>
      </li>
    </ul>

    <div id="beverage-container">
      <template v-if="beverageStore.user">
        <template v-for="beverage in beverageStore.beverages" :key="beverage.id">
          <label>
            <input
              type="radio"
              name="savedBeverage"
              :value="beverage"
              v-model="beverageStore.currentBeverage"
              @change="beverageStore.showBeverage(beverage)"
            />
            {{ beverage.name }}
          </label>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";

const beverageStore = useBeverageStore();
beverageStore.init();
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
}
li {
  margin-bottom: 1rem;
}
</style>
