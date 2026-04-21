import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import { db } from "../firebase";
import { User } from "firebase/auth";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
} from "firebase/firestore";

let beverageListener: Unsubscribe | null = null;

type StoredBeverage = BeverageType & {
  userId?: string;
};

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
    beverages: [] as StoredBeverage[],
    currentBeverage: null as StoredBeverage | null,
    currentName: "",
    user: null as User | null,
    message: "",
  }),

  actions: {
    async init() {
      const baseSnapshot = await getDocs(collection(db, "bases"));
      this.bases = baseSnapshot.docs.map((doc) => doc.data() as BaseBeverageType);

      const creamerSnapshot = await getDocs(collection(db, "creamers"));
      this.creamers = creamerSnapshot.docs.map(
        (doc) => doc.data() as CreamerType,
      );

      const syrupSnapshot = await getDocs(collection(db, "syrups"));
      this.syrups = syrupSnapshot.docs.map((doc) => doc.data() as SyrupType);

      if (this.bases.length > 0) {
        this.currentBase = this.bases[0];
      }

      if (this.creamers.length > 0) {
        this.currentCreamer = this.creamers[0];
      }

      if (this.syrups.length > 0) {
        this.currentSyrup = this.syrups[0];
      }
    },

    setUser(user: User | null) {
      this.user = user;

      if (beverageListener) {
        beverageListener();
        beverageListener = null;
      }

      if (!user) {
        this.beverages = [];
        this.currentBeverage = null;
        this.message = "";
        return;
      }

      const beveragesQuery = query(
        collection(db, "beverages"),
        where("userId", "==", user.uid),
      );

      beverageListener = onSnapshot(beveragesQuery, (snapshot) => {
        this.beverages = snapshot.docs.map(
          (doc) => doc.data() as StoredBeverage,
        );

        if (this.beverages.length === 0) {
          this.currentBeverage = null;
          return;
        }

        if (
          this.currentBeverage &&
          this.beverages.some((b) => b.id === this.currentBeverage?.id)
        ) {
          this.currentBeverage =
            this.beverages.find((b) => b.id === this.currentBeverage?.id) ?? null;
        } else {
          this.currentBeverage = this.beverages[0];
          this.showBeverage();
        }
      });
    },

    async makeBeverage() {
      if (!this.user) {
        this.message = "No user logged in, please sign in first.";
        return;
      }

      if (
        !this.currentName ||
        !this.currentBase ||
        !this.currentCreamer ||
        !this.currentSyrup
      ) {
        this.message =
          "Please complete all beverage options and the name before making a beverage.";
        return;
      }

      const beverageId = `bev-${Date.now()}`;

      const beverageData: StoredBeverage = {
        id: beverageId,
        name: this.currentName,
        temp: this.currentTemp,
        base: this.currentBase,
        syrup: this.currentSyrup,
        creamer: this.currentCreamer,
        userId: this.user.uid,
      };

      await setDoc(doc(db, "beverages", beverageId), beverageData);

      this.currentBeverage = beverageData;
      this.message = `Beverage ${this.currentName} made successfully!`;
    },

    showBeverage() {
      if (!this.currentBeverage) {
        return;
      }

      this.currentTemp = this.currentBeverage.temp;

      this.currentBase =
        this.bases.find((b) => b.id === this.currentBeverage?.base.id) ?? null;

      this.currentSyrup =
        this.syrups.find((s) => s.id === this.currentBeverage?.syrup.id) ?? null;

      this.currentCreamer =
        this.creamers.find((c) => c.id === this.currentBeverage?.creamer.id) ??
        null;

      this.currentName = this.currentBeverage.name;
    },
  },
});
