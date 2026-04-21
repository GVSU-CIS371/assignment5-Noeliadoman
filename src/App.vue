<template>
  <div id="app">

    <!-- ── Auth Panel ───────────────────────────────────────────── -->
    <div class="auth-panel">
      <template v-if="beverageStore.user">
        <div class="user-info">
          <img
            v-if="beverageStore.user.photoURL"
            :src="beverageStore.user.photoURL"
            class="avatar"
            alt="User avatar"
          />
          <span class="user-name">
            {{ beverageStore.user.displayName || beverageStore.user.email }}
          </span>
          <button class="btn btn-signout" @click="signOut">Sign Out</button>
        </div>
      </template>
      <template v-else>
        <button class="btn btn-google" @click="withGoogle">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon" />
          Sign in with Google
        </button>
      </template>

      <!-- Message area for auth errors and success -->
      <p v-if="authError" class="msg msg-error">{{ authError }}</p>
      <p v-if="beverageMessage" class="msg msg-success">{{ beverageMessage }}</p>
    </div>

    <div id="main">

      <!-- ── Beverage Preview ─────────────────────────────────────── -->
      <div id="preview">
        <Beverage :isIced="beverageStore.currentTemp === 'Cold'" />
      </div>

      <!-- ── Controls ────────────────────────────────────────────── -->
      <div id="controls">

        <!-- Temperature -->
        <fieldset class="control-group">
          <legend>Temperature</legend>
          <label
            v-for="temp in beverageStore.temps"
            :key="temp"
            class="radio-label"
          >
            <input
              type="radio"
              name="temperature"
              :value="temp"
              v-model="beverageStore.currentTemp"
            />
            {{ temp }}
          </label>
        </fieldset>

        <!-- Base -->
        <fieldset class="control-group">
          <legend>Base</legend>
          <label
            v-for="b in beverageStore.bases"
            :key="b.id"
            class="radio-label"
          >
            <input
              type="radio"
              name="bases"
              :value="b"
              v-model="beverageStore.currentBase"
            />
            {{ b.name }}
          </label>
        </fieldset>

        <!-- Syrup -->
        <fieldset class="control-group">
          <legend>Syrup</legend>
          <label
            v-for="s in beverageStore.syrups"
            :key="s.id"
            class="radio-label"
          >
            <input
              type="radio"
              name="syrups"
              :value="s"
              v-model="beverageStore.currentSyrup"
            />
            {{ s.name }}
          </label>
        </fieldset>

        <!-- Creamer -->
        <fieldset class="control-group">
          <legend>Creamer</legend>
          <label
            v-for="c in beverageStore.creamers"
            :key="c.id"
            class="radio-label"
          >
            <input
              type="radio"
              name="creamers"
              :value="c"
              v-model="beverageStore.currentCreamer"
            />
            {{ c.name }}
          </label>
        </fieldset>

        <!-- Name + Make -->
        <div class="control-group">
          <input
            type="text"
            placeholder="Beverage Name"
            v-model="beverageStore.currentName"
            class="name-input"
          />
          <button
            class="btn btn-make"
            :disabled="!beverageStore.user"
            @click="handleMakeBeverage"
          >
            🍺 Make Beverage
          </button>
          <p v-if="!beverageStore.user" class="hint">Sign in to save beverages.</p>
        </div>

      </div><!-- /controls -->

      <!-- ── Saved Beverages ──────────────────────────────────────── -->
      <div v-if="beverageStore.user && beverageStore.beverages.length > 0" id="saved">
        <h3>Your Beverages</h3>
        <div class="saved-list">
          <label
            v-for="bev in beverageStore.beverages"
            :key="bev.id"
            class="radio-label saved-item"
            :class="{ active: beverageStore.currentBeverage?.id === bev.id }"
          >
            <input
              type="radio"
              name="savedBeverages"
              :value="bev"
              v-model="beverageStore.currentBeverage"
              @change="beverageStore.showBeverage(bev)"
            />
            <span class="saved-name">{{ bev.name }}</span>
            <span class="saved-meta">{{ bev.temp }} · {{ bev.base.name }} · {{ bev.syrup.name }} · {{ bev.creamer.name }}</span>
          </label>
        </div>
      </div>

    </div><!-- /main -->
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";

const beverageStore = useBeverageStore();
const authError = ref("");
const beverageMessage = ref("");

// ── Monitor auth state via onAuthStateChanged ────────────────────
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  beverageStore.setUser(user);
});

// ── Google Sign-In ───────────────────────────────────────────────
async function withGoogle() {
  authError.value = "";
  beverageMessage.value = "";
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // onAuthStateChanged above fires setUser() automatically
  } catch (err: any) {
    authError.value = "Sign-in failed: " + (err.message ?? "Unknown error");
  }
}

// ── Sign Out ─────────────────────────────────────────────────────
async function signOut() {
  authError.value = "";
  beverageMessage.value = "";
  try {
    await firebaseSignOut(auth);
    // onAuthStateChanged fires setUser(null), clearing all beverage data
  } catch (err: any) {
    authError.value = "Sign-out failed: " + (err.message ?? "Unknown error");
  }
}

// ── Make Beverage ────────────────────────────────────────────────
async function handleMakeBeverage() {
  beverageMessage.value = "";
  authError.value = "";
  beverageMessage.value = await beverageStore.makeBeverage();
}
</script>

<style lang="scss">
* { box-sizing: border-box; }

body, html {
  margin: 0;
  min-height: 100%;
  background: linear-gradient(to bottom, #6e4228 0%, #956f5a 100%);
  font-family: Georgia, serif;
  color: #fff;
}

#app {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* ── Auth Panel ─────────────────────────────────── */
.auth-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #fff8;
}

.user-name {
  font-size: 0.95rem;
  font-weight: bold;
}

/* ── Buttons ────────────────────────────────────── */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.btn-google {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  color: #333;
  box-shadow: 0 2px 6px #0004;
}

.btn-signout {
  background: #fff3;
  color: #fff;
  border: 1px solid #fff5;
}

.btn-make {
  background: #4a2a10;
  color: #fff;
  margin-top: 8px;
  width: 100%;
  padding: 10px;
  font-size: 1rem;
}

.google-icon {
  width: 18px;
  height: 18px;
}

/* ── Messages ───────────────────────────────────── */
.msg {
  font-size: 0.85rem;
  padding: 6px 12px;
  border-radius: 4px;
  margin: 0;
}
.msg-error   { background: #c0392b99; }
.msg-success { background: #27ae6099; }

/* ── Main Layout ────────────────────────────────── */
#main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
}

#preview {
  grid-column: 1;
  grid-row: 1 / 3;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

#controls {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

#saved {
  grid-column: 2;
  grid-row: 2;

  h3 {
    margin: 0 0 8px;
    font-size: 1rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    opacity: 0.8;
  }
}

/* ── Control Groups ─────────────────────────────── */
.control-group {
  background: #fff1;
  border: 1px solid #fff2;
  border-radius: 8px;
  padding: 10px 14px;

  legend {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.75;
    padding: 0 4px;
  }
}

.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-right: 12px;
  cursor: pointer;
  font-size: 0.9rem;
}

.name-input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #fff4;
  background: #fff1;
  color: #fff;
  font-size: 0.95rem;

  &::placeholder { color: #fff8; }
  &:focus { outline: 2px solid #fff5; }
}

.hint {
  font-size: 0.78rem;
  opacity: 0.6;
  margin: 4px 0 0;
  text-align: center;
}

/* ── Saved Beverages List ───────────────────────── */
.saved-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.saved-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff1;
  border: 1px solid #fff2;
  border-radius: 6px;
  padding: 8px 12px;
  transition: background 0.15s;

  &.active, &:hover {
    background: #fff2;
  }
}

.saved-name {
  font-weight: bold;
  font-size: 0.9rem;
}

.saved-meta {
  font-size: 0.75rem;
  opacity: 0.65;
  margin-left: auto;
}
</style>
