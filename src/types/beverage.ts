// beverageStore.ts
import { defineStore } from "pinia";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { User } from "firebase/auth";
import type { BaseBeverageType, CreamerType, SyrupType, BeverageType } from "./beverage";

export const useBeverageStore = defineStore("beverage", {
  state: () => ({
    // Ingredients loaded from Firestore
    bases: [] as BaseBeverageType[],
    creamers: [] as CreamerType[],
    syrups: [] as SyrupType[],

    // Currently selected options
    currentBase: null as BaseBeverageType | null,
    currentCreamer: null as CreamerType | null,
    currentSyrup: null as SyrupType | null,

    // Beverage name & temp typed by user
    beverageName: "" as string,
    beverageTemp: "" as string,

    // User's saved beverages
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,

    // Auth
    user: null as User | null,

    // Internal: active Firestore listener
    _unsubscribeBeverages: null as Unsubscribe | null,
  }),

  actions: {
    // ── init() ───────────────────────────────────────────────────────────────
    async init() {
      const fetchCollection = async <T extends { id: string }>(
        name: string
      ): Promise<T[]> => {
        const snap = await getDocs(collection(db, name));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
      };

      const [bases, creamers, syrups] = await Promise.all([
        fetchCollection<BaseBeverageType>("bases"),
        fetchCollection<CreamerType>("creamers"),
        fetchCollection<SyrupType>("syrups"),
      ]);

      this.bases = bases;
      this.creamers = creamers;
      this.syrups = syrups;

      // Set defaults to first item in each list
      this.currentBase = bases[0] ?? null;
      this.currentCreamer = creamers[0] ?? null;
      this.currentSyrup = syrups[0] ?? null;
    },

    // ── setUser() ────────────────────────────────────────────────────────────
    setUser(user: User | null) {
      this.user = user;

      // Detach previous Firestore listener
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

      // Listen only to beverages belonging to this user
      const q = query(
        collection(db, "beverages"),
        where("userId", "==", user.uid)
      );

      this._unsubscribeBeverages = onSnapshot(q, (snap) => {
        this.beverages = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as BeverageType)
        );

        // Keep currentBeverage in sync
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

    // ── makeBeverage() ───────────────────────────────────────────────────────
    async makeBeverage(): Promise<string> {
      // Guard: must be signed in
      if (!this.user) {
        return "No user logged in, please sign in first.";
      }

      // Guard: all fields must be filled (including temp from BeverageType)
      if (
        !this.beverageName.trim() ||
        !this.beverageTemp.trim() ||
        !this.currentBase ||
        !this.currentCreamer ||
        !this.currentSyrup
      ) {
        return "Please complete all beverage options and the name before making a beverage.";
      }

      const id = `${this.user.uid}_${Date.now()}`;

      const newBeverage: BeverageType = {
        id,
        name: this.beverageName.trim(),
        temp: this.beverageTemp.trim(),
        base: this.currentBase,
        creamer: this.currentCreamer,
        syrup: this.currentSyrup,
      };

      // Write to Firestore
      await setDoc(doc(db, "beverages", id), {
        ...newBeverage,
        userId: this.user.uid, // store userId for the query filter in setUser()
      });

      // Optimistically update local state immediately
      this.beverages.push(newBeverage);
      this.currentBeverage = newBeverage;

      const name = newBeverage.name;
      this.beverageName = "";
      this.beverageTemp = "";

      return `Beverage ${name} made successfully!`;
    },
  },
});
