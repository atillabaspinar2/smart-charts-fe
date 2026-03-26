import { createStore, del, get, set } from "idb-keyval";
import type { StateStorage } from "zustand/middleware";

const dbStore = createStore("smartcharts-db", "zustand");

export const indexedDbStorage: StateStorage = {
  getItem: async (name) => {
    const value = await get<string>(name, dbStore);
    return value ?? null;
  },
  setItem: async (name, value) => {
    await set(name, value, dbStore);
  },
  removeItem: async (name) => {
    await del(name, dbStore);
  },
};

