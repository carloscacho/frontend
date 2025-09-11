'use client';
import { createContext, useContext, useState } from 'react';

const DrawerContext = createContext();

export function DrawerProvider({ children }) {
  const [drawer, setDrawer] = useState(true);

  const trocarDrawer = () => {
    setDrawer(!drawer)
  };

  return (
    <DrawerContext.Provider value={{ drawer, trocarDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => useContext(DrawerContext);
