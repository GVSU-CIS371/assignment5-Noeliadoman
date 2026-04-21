<template>
  <div>
    <div style="margin-bottom: 16px">
      <button v-if="!beverageStore.user" @click="withGoogle">
        Sign in with Google
      </button>

      <div v-else>
        <p>Signed in as: {{ beverageStore.user.displayName || beverageStore.user.email }}</p>
        <button @click="logout">Sign out</button>
      </div>

      <p v-if="beverageStore.message">{{ beverageStore.message }}</p>
    </div>

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
            />
            {{ temp }}
          </label>
        </template>
      </li>
    </ul>

    <ul>
      <li>
        <template v-for="b in beverageStore.bases" :key="b.id">
          <label>
            <input
              type="radio"
              name="bases"
              :id="`r${b.id}`"
              :value="b"
              v-model="beverageStore.currentBase"
            />
            {{ b.name }}
          </label>
        </template>
      </li>
    </ul>

    <ul>
      <li>
        <template v-for="s in beverageStore.syrups" :key="s.id">
          <label>
            <input
              type="radio"
              name="syrups"
              :id="`r${s.id}`"
              :value="s"
              v-model="beverageStore.currentSyrup"
            />
            {{ s.name }}
          </label>
        </template>
      </li>
    </ul>

    <ul>
      <li>
        <template v-for="c in beverageStore.creamers" :key="c.id">
          <label>
            <input
              type="radio"
              name="creamers"
              :id="`r${c.id}`"
              :value="c"
              v-model="beverageStore.currentCreamer"
            />
            {{ c.name }}
          </label>
        </template>
      </li>
    </ul>

    <input
      type="text"
      placeholder="Beverage Name"
      v-model="beverageStore.currentName"
    />

    <button
      @click="beverageStore.makeBeverage"
      :disabled="!beverageStore.user"
    >
      🍺 Make Beverage
    </button>

    <div
      v-if="beverageStore.user && beverageStore.beverages.length > 0"
      style="margin-top: 20px"
    >
      <h3>Saved Beverages</h3>
      <template v-for="bev in beverageStore.beverages" :key="bev.id">
        <label style="display: block">
          <input
            type="radio"
            name="savedBeverages"
            :value="bev"
            v-model="beverageStore.currentBeverage"
            @change="beverageStore.showBeverage"
          />
          {{ bev.name }}
        </label>
      </template>
    </div>
  </div>

  <div id="beverage-container" style="margin-top: 20px"></div>
</template>

<script setup lang="ts">
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";
import { auth } from "./firebase";

const beverageStore = useBeverageStore();

const withGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (error) {
    beverageStore.message = "Google sign in failed.";
    console.error(error);
  }
};

const logout = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, (user) => {
  beverageStore.setUser(user);
});
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
</style>
