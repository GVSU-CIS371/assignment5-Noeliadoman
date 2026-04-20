import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import db, { auth } from "../firebase.ts";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

let unsubscribeBeverages: (() => void) | null = null;

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
    user: null as User | null,
    message: "",
    flashMessage: "",
  }),

  actions: {
    async init() {
      const basesSnapshot = await getDocs(collection(db, "bases"));
      basesSnapshot.forEach((doc) => {
        this.bases.push(doc.data() as BaseBeverageType);
      });

      const creamersSnapshot = await getDocs(collection(db, "creamers"));
      creamersSnapshot.forEach((doc) => {
        this.creamers.push(doc.data() as CreamerType);
      });

      const syrupsSnapshot = await getDocs(collection(db, "syrups"));
      syrupsSnapshot.forEach((doc) => {
        this.syrups.push(doc.data() as SyrupType);
      });

      this.currentBase = this.bases[0];
      this.currentCreamer = this.creamers[0];
      this.currentSyrup = this.syrups[0];

      onAuthStateChanged(auth, (user: User | null) => {
        this.setUser(user);
      });
    },

    setUser(user: User | null) {
      this.user = user;

      if (unsubscribeBeverages) {
        unsubscribeBeverages();
        unsubscribeBeverages = null;
      }

      if (user) {
        const q = query(
          collection(db, "beverages"),
          where("uid", "==", user.uid)
        );
        unsubscribeBeverages = onSnapshot(q, (snapshot) => {
          this.beverages = [];
          snapshot.forEach((doc) => {
            this.beverages.push(doc.data() as BeverageType);
          });
          if (this.currentBeverage) {
            const found = this.beverages.find(
              (b) => b.id === this.currentBeverage!.id
            );
            this.currentBeverage = found ?? null;
          }
        });
      } else {
        this.beverages = [];
        this.currentBeverage = null;
      }
    },

    async withGoogle() {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        this.flashMessage = "Signed in with Google";
        setTimeout(() => {
          this.flashMessage = "";
        }, 2000);
      } catch (error: any) {
        this.flashMessage = "Error signing in: " + error.message;
        setTimeout(() => {
          this.flashMessage = "";
        }, 2000);
      }
    },

    async signOut() {
      await signOut(auth);
      this.flashMessage = "Signed Out.";
      setTimeout(() => {
        this.flashMessage = "";
      }, 2000);
    },

    async makeBeverage() {
      if (!this.user) {
        this.message = "No user logged in, please sign in first.";
        return this.message;
      }

      if (
        !this.currentBase ||
        !this.currentSyrup ||
        !this.currentCreamer ||
        !this.currentName.trim()
      ) {
        this.message =
          "Please complete all beverage options and the name before making a beverage.";
        return this.message;
      }

      const newBeverage: BeverageType = {
        id: `bev-${Date.now()}`,
        name: this.currentName,
        temp: this.currentTemp,
        base: this.currentBase,
        syrup: this.currentSyrup,
        creamer: this.currentCreamer,
      };

      await setDoc(doc(db, "beverages", newBeverage.id), {
        ...newBeverage,
        uid: this.user.uid,
      });

      this.currentName = "";
      this.message = `Beverage ${newBeverage.name} made successfully!`;
      setTimeout(() => {
        this.message = "";
      }, 2000);

      return this.message;
    },

    showBeverage(beverage: BeverageType) {
      this.currentBeverage = beverage;
      this.currentName = beverage.name;
      this.currentTemp = beverage.temp;
      this.currentBase = beverage.base;
      this.currentSyrup = beverage.syrup;
      this.currentCreamer = beverage.creamer;
    },
  },
});
