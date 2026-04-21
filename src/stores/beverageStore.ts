import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import { db } from "../firebase.ts";
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
import { User } from "firebase/auth";

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
    beverageListener: null as Unsubscribe | null,
  }),

  actions: {
    async init() {     
      const basesSnapshot = await getDocs(collection(db, "bases"));
      this.bases = basesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BaseBeverageType));
      this.currentBase = this.bases[0] || null;
     
      const creamersSnapshot = await getDocs(collection(db, "creamers"));
      this.creamers = creamersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CreamerType));
      this.currentCreamer = this.creamers[0] || null;
      
      const syrupsSnapshot = await getDocs(collection(db, "syrups"));
      this.syrups = syrupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SyrupType));
      this.currentSyrup = this.syrups[0] || null;
    },

    setUser(user: User | null) {
      this.user = user;
     
      if (this.beverageListener) {
        this.beverageListener();
        this.beverageListener = null;
      }
     
      if (!user) {
        this.beverages = [];
        this.currentBeverage = null;
        return;
      }
   
      const q = query(collection(db, "beverages"), where("userId", "==", user.uid));
      this.beverageListener = onSnapshot(q, (querySnapshot) => {       
        querySnapshot.docChanges().forEach((change) => {
          const beverage = {
            id: change.doc.id,
            ...change.doc.data()
          } as BeverageType;

          if (change.type === "added") {           
            if (!this.beverages.find(b => b.id === beverage.id)) {
              this.beverages.push(beverage);
            }
          } else if (change.type === "modified") {           
            const index = this.beverages.findIndex(b => b.id === beverage.id);
            if (index !== -1) {
              this.beverages[index] = beverage;
            }
          } else if (change.type === "removed") {         
            this.beverages = this.beverages.filter(b => b.id !== beverage.id);
          }
        });
  
        this.currentBeverage = this.beverages[0] || null;
      });
    },

    async makeBeverage(): Promise<string> { 
      if (!this.user) {
        return "No user logged in, please sign in first.";
      }
   
      if (!this.currentBase || !this.currentCreamer || !this.currentSyrup || !this.currentName.trim()) {
        return "Please complete all beverage options and the name before making a beverage.";
      }
 
      const beverageId = `${this.user.uid}_${Date.now()}`;
  
      const newBeverage: BeverageType = {
        id: beverageId,
        name: this.currentName.trim(),
        temp: this.currentTemp,
        base: this.currentBase,
        syrup: this.currentSyrup,
        creamer: this.currentCreamer,
      };

      try {     
        await setDoc(doc(db, "beverages", beverageId), {
          ...newBeverage,
          userId: this.user.uid,
        });

        this.currentName = "";

        return `Beverage ${newBeverage.name} made successfully!`;
      } catch (error) {
        console.error("Error creating beverage:", error);
        return "Failed to create beverage. Please try again.";
      }
    },

    async refreshIngredients() {   
      const basesSnapshot = await getDocs(collection(db, "bases"));
      this.bases = basesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BaseBeverageType));
   
      const creamersSnapshot = await getDocs(collection(db, "creamers"));
      this.creamers = creamersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CreamerType));
  
      const syrupsSnapshot = await getDocs(collection(db, "syrups"));
      this.syrups = syrupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SyrupType));
    },

    showBeverage(beverage: BeverageType) { 
      this.currentTemp = beverage.temp;
      this.currentBase = beverage.base;
      this.currentCreamer = beverage.creamer;
      this.currentSyrup = beverage.syrup;
      this.currentBeverage = beverage;
      this.currentName = beverage.name;
    },
  },
});
