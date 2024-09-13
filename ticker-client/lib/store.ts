import { configureStore } from "@reduxjs/toolkit";
import dataSlice from "./features/dataSlice";

export const makeStore = () => {
  return configureStore({
    reducer: dataSlice,
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
