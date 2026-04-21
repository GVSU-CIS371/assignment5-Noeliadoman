<template>
  <div>
    <!-- ── Auth Bar ─────────────────────────────────────────────── -->
    <div style="margin-bottom: 12px;">
      <template v-if="beverageStore.user">
        <span>👤 {{ beverageStore.user.displayName || beverageStore.user.email }}</span>
        <button @click="signOut" style="margin-left: 12px;">Sign Out</button>
      </template>
      <template v-else>
        <button @click="withGoogle">Sign in with Google</button>
      </template>
      <p v-if="authError" style="color: red;">{{ authError }}</p>
    </div>

    <!-- ── Beverage Builder ─────────────────────────────────────── -->
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
      @click="handleMakeBeverage"
      :disabled="!beverageStore.user"
    >
      🍺 Make Beverage
    </button>

    <p v-if="beverageMessage">{{ beverageMessage }}</p>

    <!-- ── Saved Beverages (only shown when signed in) ──────────── -->
    <div v-if="beverageStore.user" id="beverage-container" style="margin-top: 20px">
      <h3>Your Beverages</h3>
      <ul v-if="beverageStore.beverages.length > 0">
        <li
          v-for="bev in beverageStore.beverages"
          :key="bev.id"
          @click="beverageStore.showBeverage(bev)"
          style="cursor: pointer;"
          :style="{ fontWeight: beverageStore.currentBeverage?.id === bev.id ? 'bold' : 'normal' }"
        >
          {{ bev.name }} — {{ bev.temp }} / {{ bev.base.name }} / {{ bev.syrup.name }} / {{ bev.creamer.name }}
        </li>
      </ul>
      <p v-else>No beverages yet. Make one above!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from "firebase/auth";
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";

const beverageStore = useBeverageStore();
const authError = ref("");
const beverageMessage = ref("");

// ── Google Sign-In ───────────────────────────────────────────────
async function withGoogle() {
  authError.value = "";
  try {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // onAuthStateChanged in the store's init() will call setUser() automatically
  } catch (err: any) {
    authError.value = "Sign-in failed: " + (err.message ?? "Unknown error");
  }
}

// ── Sign Out ─────────────────────────────────────────────────────
async function signOut() {
  authError.value = "";
  try {
    const auth = getAuth();
    await firebaseSignOut(auth);
    // onAuthStateChanged will call setUser(null), clearing beverages
  } catch (err: any) {
    authError.value = "Sign-out failed: " + (err.message ?? "Unknown error");
  }
}

// ── Make Beverage ────────────────────────────────────────────────
async function handleMakeBeverage() {
  beverageMessage.value = "";
  beverageMessage.value = await beverageStore.makeBeverage();
}
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
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
