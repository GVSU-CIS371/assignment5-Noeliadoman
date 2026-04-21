import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import db from "../firebase.ts";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: tempretures,
    currentTemp: tempretures[0],
    bases: [] as BaseBeverageType[],
    currentBase: null as BaseBeverageType | null,
    syrups: [] as SyrupType[],
    currentSyrup: null as SyrupType | null,
    creamers: [] as CreamerType[],
    currentCreamer: null as CreamerType | null,
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,
    currentName: "",
    // Auth state
    user: null as User | null,
    _unsubscribeBeverages: null as (() => void) | null,
  }),

  actions: {
    // ── init() ───────────────────────────────────────────────────────────────
    async init() {
      // Load all three ingredient collections from Firestore
      const [basesSnap, creamersSnap, syrupsSnap] = await Promise.all([
        getDocs(collection(db, "bases")),
        getDocs(collection(db, "creamers")),
        getDocs(collection(db, "syrups")),
      ]);

      this.bases = basesSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as BaseBeverageType)
      );
      this.creamers = creamersSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as CreamerType)
      );
      this.syrups = syrupsSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as SyrupType)
      );

      // Set defaults to first item in each list
      this.currentBase = this.bases[0] ?? null;
      this.currentCreamer = this.creamers[0] ?? null;
      this.currentSyrup = this.syrups[0] ?? null;

      // Watch auth state and call setUser() whenever it changes
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        this.setUser(user);
      });
    },

    // ── setUser() ─────────────────────────────────────────────────────────────
    setUser(user: User | null) {
      this.user = user;

      // Detach previous listener if one exists
      if (this._unsubscribeBeverages) {
        this._unsubscribeBeverages();
        this._unsubscribeBeverages = null;
      }

      if (!user) {
        // Logged out — clear beverage data
        this.beverages = [];
        this.currentBeverage = null;
        return;
      }

      // Start a real-time listener scoped to this user's beverages
      const q = query(
        collection(db, "beverages"),
        where("userId", "==", user.uid)
      );

      this._unsubscribeBeverages = onSnapshot(q, (snap) => {
        this.beverages = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as BeverageType)
        );

        // Keep currentBeverage in sync with the updated list
        if (this.currentBeverage) {
          const refreshed = this.beverages.find(
            (b) => b.id === this.currentBeverage!.id
          );
          this.currentBeverage = refreshed ?? this.beverages[0] ?? null;
        } else {
          this.currentBeverage = this.beverages[0] ?? null;
        }
      });
    },

    // ── makeBeverage() ────────────────────────────────────────────────────────
    async makeBeverage(): Promise<string> {
      // Guard: must be signed in
      if (!this.user) {
        return "No user logged in, please sign in first.";
      }

      // Guard: all fields must be filled
      if (
        !this.currentName.trim() ||
        !this.currentBase ||
        !this.currentCreamer ||
        !this.currentSyrup ||
        !this.currentTemp
      ) {
        return "Please complete all beverage options and the name before making a beverage.";
      }

      const id = `${this.user.uid}_${Date.now()}`;

      const newBeverage: BeverageType = {
        id,
        name: this.currentName.trim(),
        temp: this.currentTemp,
        base: this.currentBase,
        creamer: this.currentCreamer,
        syrup: this.currentSyrup,
      };

      // Write to Firestore (userId stored for query filtering)
      await setDoc(doc(db, "beverages", id), {
        ...newBeverage,
        userId: this.user.uid,
      });

      // Optimistically update local state so UI responds immediately
      this.beverages.push(newBeverage);
      this.currentBeverage = newBeverage;

      const name = newBeverage.name;
      this.currentName = ""; // clear the name input

      return `Beverage ${name} made successfully!`;
    },

    // ── showBeverage() ────────────────────────────────────────────────────────
    showBeverage(beverage: BeverageType) {
      this.currentBeverage = beverage;
    },
  },
});
